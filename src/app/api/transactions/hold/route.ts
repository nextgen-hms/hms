import { NextRequest, NextResponse } from 'next/server';
import pool from '@/database/db';
import { ApiResponse, Transaction } from '@/src/lib/types';
import { getCurrentStaffId } from '@/src/lib/utils';

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    const transaction: Transaction = await request.json();
    
    if (!transaction.items || transaction.items.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Transaction must contain at least one item'
      }, { status: 400 });
    }

    await client.query('BEGIN');

    const staffId = getCurrentStaffId();

    // Insert held transaction
    const holdResult = await client.query(`
      INSERT INTO pos_held_transaction (
        staff_id,
        customer_name,
        customer_phone,
        total_amount,
        status,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING hold_id
    `, [
      staffId,
      transaction.customer?.name || null,
      transaction.customer?.phone || null,
      transaction.payment.payableAmount,
      'held',
      `Held by ${transaction.cashier}`
    ]);

    const holdId = holdResult.rows[0].hold_id;

    // Insert held transaction details
    for (const item of transaction.items) {
      await client.query(`
        INSERT INTO pos_held_transaction_detail (
          hold_id,
          medicine_id,
          qty,
          sub_qty,
          unit_price,
          discount_percent,
          line_total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        holdId,
        item.medicine.medicine_id,
        item.quantity,
        item.subQuantity,
        item.unitPrice,
        item.discountPercent,
        item.lineTotal
      ]);
    }

    await client.query('COMMIT');

    return NextResponse.json<ApiResponse<{ holdId: string }>>({
      success: true,
      data: { holdId: holdId.toString() },
      message: 'Transaction held successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Hold transaction error:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to hold transaction'
    }, { status: 500 });
    
  } finally {
    client.release();
  }
}

export async function GET(request: NextRequest) {
  try {
    const staffId = getCurrentStaffId();
     const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        ht.*,
        json_agg(
          json_build_object(
            'medicine_id', htd.medicine_id,
            'qty', htd.qty,
            'sub_qty', htd.sub_qty,
            'unit_price', htd.unit_price,
            'discount_percent', htd.discount_percent,
            'line_total', htd.line_total,
            'medicine', m.*
          )
        ) as items
      FROM pos_held_transaction ht
      LEFT JOIN pos_held_transaction_detail htd ON ht.hold_id = htd.hold_id
      LEFT JOIN medicine m ON htd.medicine_id = m.medicine_id
      WHERE ht.staff_id = $1 AND ht.status = 'held'
      GROUP BY ht.hold_id
      ORDER BY ht.hold_timestamp DESC
    `, [staffId]);

    return NextResponse.json<ApiResponse<Transaction[]>>({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get held transactions error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch held transactions'
    }, { status: 500 });
  }
}