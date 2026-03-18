import { NextResponse } from 'next/server';
import pool from '@/database/db';

/**
 * GET /api/pharmacy/transactions
 * Returns all medicine movements (purchase / sale / sale_return / purchase_return)
 * from medicine_transaction joined with contextual info for each type.
 *
 * NOTE: Financial totals (amounts, party balances) are intentionally EXCLUDED here.
 * They will be shown in Admin > Financials when role-based access is implemented.
 */
export async function GET() {
    try {
        const result = await pool.query(`
            SELECT
                mt.txn_id,
                mt.txn_type,
                mt.quantity,
                mt.sub_quantity,
                mt.created_at,
                mt.ref_purchase_id,
                mt.ref_sale_id,
                mt.ref_purchase_return,
                mt.ref_sale_return,
                mt.batch_id,

                -- Medicine info
                m.medicine_id,
                COALESCE(m.brand_name, m.generic_name) AS medicine_name,
                m.dosage_unit AS unit,
                m.sub_unit,

                -- Batch info
                mb.batch_number,
                mb.expiry_date,

                -- Purchase context (txn_type = 'purchase' or 'purchase_return')
                mp.invoice_no,
                mp.party_id,
                pt.name AS party_name,

                -- Sale context (txn_type = 'sale' or 'sale_return')
                ps.sale_id,
                ps.visit_id,
                ps.bill_id,
                ps.is_prescription_sale,

                -- Sale return context
                sr.return_id AS sale_return_id,
                sr.reason   AS sale_return_reason,

                -- Purchase return context
                pr.return_id AS purchase_return_id

            FROM medicine_transaction mt
            JOIN medicine m ON m.medicine_id = mt.medicine_id
            LEFT JOIN medicine_batch       mb ON mb.batch_id      = mt.batch_id
            LEFT JOIN medicine_purchase    mp ON mp.purchase_id   = mt.ref_purchase_id
            LEFT JOIN party                pt ON pt.party_id      = mp.party_id
            LEFT JOIN pharmacy_sale        ps ON ps.sale_id       = mt.ref_sale_id
            LEFT JOIN sale_return          sr ON sr.return_id     = mt.ref_sale_return
            LEFT JOIN purchase_return      pr ON pr.return_id     = mt.ref_purchase_return

            ORDER BY mt.created_at DESC
            LIMIT 500
        `);

        return NextResponse.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Transactions fetch error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
