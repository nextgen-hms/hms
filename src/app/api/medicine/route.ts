import { NextRequest, NextResponse } from "next/server";
import { query } from '@/database/db'

export async function GET(req: NextRequest) {

    //fetch patient party from db
    try {

        const sql = `
            SELECT 
                m.*,
                m.medicine_id as id,
                COALESCE(SUM(mb.stock_quantity), 0) as stock_quantity,
                COALESCE(SUM(mb.stock_sub_quantity), 0) as stock_sub_quantity
            FROM medicine m
            LEFT JOIN medicine_batch mb ON m.medicine_id = mb.medicine_id 
                AND (mb.expiry_date > CURRENT_DATE OR mb.expiry_date IS NULL)
            GROUP BY m.medicine_id
        `;
        const data = await query(sql);

        return NextResponse.json(data.rows);


    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "something went wrong" }, { status: 500 });
    }


}