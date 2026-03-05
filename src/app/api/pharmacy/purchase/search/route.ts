import { NextRequest, NextResponse } from "next/server";
import { query } from "@/database/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("query") || "";

    try {
        const sql = `
            SELECT 
                mp.purchase_id,
                mp.invoice_no,
                mp.invoice_timestamp,
                p.name as party_name,
                mp.total_amount,
                json_agg(json_build_object(
                    'id', mpd.id,
                    'medicine_id', mpd.medicine_id,
                    'brand_name', m.brand_name,
                    'generic_name', m.generic_name,
                    'dosage', m.dosage_value || m.dosage_unit,
                    'form', m.form,
                    'quantity', mpd.quantity,
                    'sub_quantity', COALESCE(mpd.sub_quantity, 0),
                    'unit_cost', mpd.unit_cost,
                    'batch_id', mpd.batch_id,
                    'batch_number', mb.batch_number,
                    'expiry_date', mb.expiry_date
                )) as items
            FROM medicine_purchase mp
            JOIN party p ON mp.party_id = p.party_id
            JOIN medicine_purchase_detail mpd ON mp.purchase_id = mpd.purchase_id
            JOIN medicine m ON mpd.medicine_id = m.medicine_id
            JOIN medicine_batch mb ON mpd.batch_id = mb.batch_id
            WHERE mp.invoice_no ILIKE $1 OR p.name ILIKE $1
            GROUP BY mp.purchase_id, p.name
            ORDER BY mp.invoice_timestamp DESC
            LIMIT 20
        `;

        const result = await query(sql, [`%${searchTerm}%`]);
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error("Search Purchase Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
