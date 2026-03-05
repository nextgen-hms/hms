import { NextRequest, NextResponse } from "next/server";
import { query } from "@/database/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { purchase_id, reason, created_by, items } = body;

        if (!purchase_id || !items || items.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Start Transaction
        await query("BEGIN");

        // 1. Create Purchase Return Header
        const returnHeaderSql = `
            INSERT INTO purchase_return (purchase_id, reason, created_by)
            VALUES ($1, $2, $3)
            RETURNING return_id
        `;
        const headerResult = await query(returnHeaderSql, [purchase_id, reason, created_by]);
        const returnId = headerResult.rows[0].return_id;

        // 2. Insert Return Details
        // existing DB trigger tg_purchase_return_detail_to_txn will handle stock reduction automatically
        const detailSql = `
            INSERT INTO purchase_return_detail (
                return_id, medicine_id, batch_id, quantity, sub_quantity, returned_unit_price
            )
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        for (const item of items) {
            await query(detailSql, [
                returnId,
                item.medicine_id,
                item.batch_id,
                item.quantity,
                item.sub_quantity || 0,
                item.unit_cost
            ]);
        }

        await query("COMMIT");

        return NextResponse.json({ success: true, returnId });
    } catch (error: any) {
        await query("ROLLBACK");
        console.error("Process Purchase Return Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
