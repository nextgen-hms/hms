import { NextRequest, NextResponse } from 'next/server';
import pool from '@/database/db';
import { ApiResponse, Transaction } from '@/src/lib/types';
import { generateReference, getCurrentStaffId } from '@/src/lib/utils';

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const transaction: Transaction = await request.json();

    // Validate request
    if (!transaction.items || transaction.items.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Transaction must contain at least one item'
      }, { status: 400 });
    }

    // Start database transaction
    await client.query('BEGIN');

    // Generate reference if not provided
    const reference = transaction.reference || generateReference();
    const staffId = getCurrentStaffId();

    // Insert into pharmacy_sale
    const saleResult = await client.query(`
      INSERT INTO pharmacy_sale (
        visit_id,
        bill_id,
        handled_by,
        total_amount,
        status,
        payment_type,
        payment_reference,
        paid_amount,
        due_amount,
        change_amount,
        discount_percent,
        discount_amount,
        customer_id,
        is_prescription_sale,
        prescription_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING sale_id, sale_timestamp
    `, [
      transaction.visitId || null,
      transaction.billId || null,
      staffId,
      transaction.payment.payableAmount,
      'Completed',
      transaction.payment.type,
      reference,
      transaction.payment.paidAmount,
      transaction.payment.dueAmount,
      transaction.payment.changeAmount,
      transaction.payment.adjustmentPercent,
      transaction.payment.adjustment,
      transaction.customerId || null,
      !!transaction.prescriptionId,
      transaction.prescriptionId || null
    ]);

    const saleId = saleResult.rows[0].sale_id;
    const saleTimestamp = saleResult.rows[0].sale_timestamp;


    // Insert sale details
    for (const item of transaction.items) {
      const subUnitsPerUnit = (item.medicine as any).sub_units_per_unit || 1;
      const subUnitPrice = item.medicine.batch_sale_sub_unit_price
        || (item.medicine as any).sub_unit_price
        || (item.price / subUnitsPerUnit);

      const itemTotalBeforeDiscount = (item.quantity * item.price) + (item.subQuantity * subUnitPrice);
      const discountAmount = Number(((itemTotalBeforeDiscount * item.discountPercent) / 100).toFixed(2));
      const lineTotal = Number((itemTotalBeforeDiscount - discountAmount).toFixed(2));

      await client.query(`
        INSERT INTO pharmacy_sale_detail (
          sale_id,
          medicine_id,
          batch_id,
          quantity,
          sub_quantity,
          unit_sale_price,
          sub_unit_sale_price,
          discount_percent,
          discount_amount,
          line_total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        saleId,
        item.medicine.id,
        item.batchId || null,
        item.quantity,
        item.subQuantity,
        item.price,
        subUnitPrice,
        item.discountPercent,
        discountAmount,
        lineTotal
      ]);
    }

    // Insert audit log
    await client.query(`
      INSERT INTO pos_audit_log (
        staff_id,
        action_type,
        sale_id,
        description
      ) VALUES ($1, $2, $3, $4)
    `, [
      staffId,
      'SALE_COMPLETED',
      saleId,
      `Completed sale ${reference} with ${transaction.items.length} items`
    ]);

    // Commit transaction
    await client.query('COMMIT');

    return NextResponse.json<ApiResponse<Transaction & { id: string; timestamp: Date }>>({
      success: true,
      data: {
        ...transaction,
        id: saleId.toString(),
        timestamp: saleTimestamp,
        reference
      },
      message: 'Transaction completed successfully'
    });

  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to process transaction'
    }, { status: 500 });

  } finally {
    client.release();
  }
}