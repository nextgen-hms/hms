import { NextRequest, NextResponse } from 'next/server';
import pool from '@/database/db';
import { ApiResponse } from '@/src/lib/types';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const medicineId = searchParams.get('medicine_id');
        const type = searchParams.get('type');

        if (type === 'last-invoice') {
            const result = await pool.query(`
        SELECT invoice_no 
        FROM medicine_purchase 
        ORDER BY created_at DESC 
        LIMIT 1
      `);

            return NextResponse.json<ApiResponse>({
                success: true,
                data: result.rows[0] || null
            });
        }

        if (type === 'price-history' && medicineId) {
            const result = await pool.query(`
        SELECT purchase_price, purchase_sub_unit_price, sale_price, sale_sub_unit_price, expiry_date, batch_number
        FROM medicine_batch
        WHERE medicine_id = $1
        ORDER BY received_date DESC
        LIMIT 1
      `, [medicineId]);

            return NextResponse.json<ApiResponse>({
                success: true,
                data: result.rows[0] || null
            });
        }

        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Invalid request type or missing parameters'
        }, { status: 400 });

    } catch (error) {
        console.error('Purchase utils error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch purchase utilities'
        }, { status: 500 });
    }
}
