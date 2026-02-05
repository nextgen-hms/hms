import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/database/db';
import { ApiResponse } from '@/src/lib/types';
import { getCurrentStaffId } from '@/src/lib/utils';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, printerName } = body;

    if (!transactionId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Transaction ID is required'
      }, { status: 400 });
    }

    // Get transaction details
    const saleResult = await query(`
      SELECT 
        ps.*,
        s.name as staff_name,
        p.patient_name,
        json_agg(
          json_build_object(
            'medicine_name', m.brand_name,
            'generic_name', m.generic_name,
            'qty', psd.qty,
            'unit_price', psd.unit_price,
            'discount_percent', psd.discount_percent,
            'total_price', psd.total_price
          )
        ) as items
      FROM pharmacy_sale ps
      LEFT JOIN staff s ON ps.handled_by = s.staff_id
      LEFT JOIN visit v ON ps.visit_id = v.visit_id
      LEFT JOIN patient p ON v.patient_id = p.patient_id
      LEFT JOIN pharmacy_sale_detail psd ON ps.sale_id = psd.sale_id
      LEFT JOIN medicine m ON psd.medicine_id = m.medicine_id
      WHERE ps.sale_id = $1
      GROUP BY ps.sale_id, s.name, p.patient_name
    `, [transactionId]);

    if (saleResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Transaction not found'
      }, { status: 404 });
    }

    const transaction = saleResult.rows[0];

    // Get receipt config
    const configResult = await query(`
      SELECT * FROM pos_receipt_config WHERE is_active = true LIMIT 1
    `);

    const config = configResult.rows[0] || {
      clinic_name: 'Pharmacy',
      clinic_address: '',
      clinic_phone: '',
      receipt_footer: 'Thank you for your visit!'
    };

    // TODO: Integrate with actual thermal printer
    // For now, just log the receipt data
    console.log('Printing receipt:', {
      config,
      transaction,
      printer: printerName
    });

    // Insert audit log
    const staffId = getCurrentStaffId();
    await query(`
      INSERT INTO pos_audit_log (
        staff_id,
        action_type,
        sale_id,
        description
      ) VALUES ($1, $2, $3, $4)
    `, [
      staffId,
      'RECEIPT_PRINTED',
      transactionId,
      `Receipt printed for sale ${transaction.payment_reference}`
    ]);

    return NextResponse.json<ApiResponse<{ printed: boolean }>>({
      success: true,
      data: { printed: true },
      message: 'Receipt sent to printer'
    });

  } catch (error) {
    console.error('Print receipt error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to print receipt'
    }, { status: 500 });
  }
}