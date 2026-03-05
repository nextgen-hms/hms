import { NextRequest, NextResponse } from 'next/server';
import pool from '@/database/db';
import { ApiResponse } from '@/src/lib/types';
import { getCurrentStaffId } from '@/src/lib/utils';

export async function POST(request: NextRequest) {
    const client = await pool.connect();

    try {
        const body = await request.json();
        const { party_id, invoice_no, total_amount, payment_status, items } = body;

        if (!party_id || !invoice_no || !items || items.length === 0) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Missing required fields: party_id, invoice_no, and items are required.'
            }, { status: 400 });
        }

        const staffId = getCurrentStaffId();

        // Start database transaction
        await client.query('BEGIN');

        // 1. Insert into medicine_purchase (Header)
        const purchaseResult = await client.query(`
      INSERT INTO medicine_purchase (
        party_id,
        invoice_no,
        invoice_timestamp,
        total_amount,
        payment_status,
        created_by
      ) VALUES ($1, $2, NOW(), $3, $4, $5)
      RETURNING purchase_id
    `, [
            party_id,
            invoice_no,
            total_amount || 0,
            payment_status || 'Paid',
            staffId
        ]);

        const purchaseId = purchaseResult.rows[0].purchase_id;

        // 2. Process each item (Detail + Batch)
        for (const item of items) {
            const {
                medicine_id,
                quantity,
                unit_cost,
                sub_quantity,
                sub_unit_cost,
                batch_number,
                expiry_date,
                sale_price,
                sale_sub_unit_price
            } = item;

            // Handle Batch: Check if exists or create new
            let batchId: number;
            const batchCheck = await client.query(`
        SELECT batch_id FROM medicine_batch 
        WHERE medicine_id = $1 AND batch_number = $2
      `, [medicine_id, batch_number]);

            if (batchCheck.rows.length > 0) {
                batchId = batchCheck.rows[0].batch_id;
                // Update existing batch prices and expiry if provided
                await client.query(`
          UPDATE medicine_batch 
          SET purchase_price = COALESCE($1, purchase_price),
              purchase_sub_unit_price = COALESCE($2, purchase_sub_unit_price),
              sale_price = COALESCE($3, sale_price),
              sale_sub_unit_price = COALESCE($4, sale_sub_unit_price),
              expiry_date = COALESCE($5, expiry_date)
          WHERE batch_id = $6
        `, [unit_cost, sub_unit_cost, sale_price, sale_sub_unit_price, expiry_date, batchId]);
            } else {
                // Create new batch
                const batchCreate = await client.query(`
          INSERT INTO medicine_batch (
            medicine_id,
            batch_number,
            expiry_date,
            purchase_price,
            purchase_sub_unit_price,
            sale_price,
            sale_sub_unit_price,
            stock_quantity,
            stock_sub_quantity,
            received_date,
            party_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, NOW(), $8)
          RETURNING batch_id
        `, [
                    medicine_id,
                    batch_number,
                    expiry_date,
                    unit_cost,
                    sub_unit_cost,
                    sale_price,
                    sale_sub_unit_price,
                    party_id
                ]);
                batchId = batchCreate.rows[0].batch_id;
            }

            // 3. Insert into medicine_purchase_detail
            // Note: Existing DB triggers on this table will handle the stock increment
            // and create the medicine_transaction entry.
            await client.query(`
        INSERT INTO medicine_purchase_detail (
          purchase_id,
          medicine_id,
          quantity,
          unit_cost,
          sub_quantity,
          sub_unit_cost,
          batch_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
                purchaseId,
                medicine_id,
                quantity,
                unit_cost,
                sub_quantity || 0,
                sub_unit_cost || 0,
                batchId
            ]);
        }

        // 4. Audit Log
        await client.query(`
      INSERT INTO pos_audit_log (staff_id, action_type, description)
      VALUES ($1, $2, $3)
    `, [
            staffId,
            'PURCHASE_CREATED',
            `Medicine purchase invoice #${invoice_no} (ID: ${purchaseId}) created with ${items.length} items.`
        ]);

        // Commit transaction
        await client.query('COMMIT');

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Purchase invoice saved and stock updated successfully',
            data: { purchaseId, invoice_no }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Medicine purchase error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to process medicine purchase transaction.'
        }, { status: 500 });
    } finally {
        client.release();
    }
}
