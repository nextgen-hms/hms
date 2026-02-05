import pool from "@/database/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Return Medicines API (Sale Return)
 *
 * Responsibilities:
 * - Insert into sale_return (header-level record of return)
 * - Insert into sale_return_detail (line items for returned medicines)
 * - Update prescription_medicines (reduce dispensed_quantity, reset metadata if <= 0)
 * - Update pharmacy_sale (mark as Returned if all items returned)
 * - Update bill_item (remove returned items from billing)
 *
 * Best Practices applied here:
 * ✅ Transaction safety with BEGIN/COMMIT/ROLLBACK
 * ✅ Parameterized queries (prevents SQL injection)
 * ✅ Inline comments for clarity & maintainability
 */
export async function POST(req: NextRequest) {
  const body = await req.json(); // Expected: { reason, created_by, items: [...] }
  const client = await pool.connect();

  try {
    // 🚀 Start a transaction → ensures either all changes succeed or none
    await client.query("BEGIN");

    const { reason, created_by, items } = body;

    // 🔎 Step 1: Use sale_id directly from payload (already included in items[0])
    const sale_id = items[0].sale_id;

    // 1️⃣ Insert into sale_return (header row for the return)
    const returnRes = await client.query(
      `INSERT INTO sale_return (sale_id, reason, return_timestamp, created_by)
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
       RETURNING return_id`,
      [sale_id, reason, created_by]
    );
    const return_id = returnRes.rows[0].return_id;

    // 2️⃣ Process each returned medicine (loop over items array)
    for (const item of items) {
      const { medicine_id, dispensed_quantity, unit_price, prescription_medicine_id } = item;

      // (a) Insert line item into sale_return_detail
      await client.query(
        `INSERT INTO sale_return_detail (return_id, medicine_id, qty, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [return_id, medicine_id, dispensed_quantity, unit_price]
      );

      // (b) Update prescription_medicines → reduce dispensed quantity
      await client.query(
        `UPDATE prescription_medicines
         SET dispensed_quantity = GREATEST(dispensed_quantity - $1, 0), -- clamp at 0 (no negatives)
             dispensed_by = CASE WHEN dispensed_quantity - $1 <= 0 THEN NULL ELSE dispensed_by END,
             dispensed_at = CASE WHEN dispensed_quantity - $1 <= 0 THEN NULL ELSE dispensed_at END
         WHERE prescription_medicine_id = $2`,
        [dispensed_quantity, prescription_medicine_id]
      );

      // (c) (Optional) If you track pharmacy_sale_detail → could mark item returned
      // Skipped for now since you said you’ll only deal with "completed" medicines.

      // (d) Remove returned item from bill_item (so billing matches actual dispensed qty)
      await client.query(
        `DELETE FROM bill_item
         WHERE bill_id = (SELECT bill_id FROM pharmacy_sale WHERE sale_id = $1)
           AND description = (SELECT brand_name FROM medicine WHERE medicine_id = $2)
           AND amount = $3`,
        [sale_id, medicine_id, unit_price * dispensed_quantity]
      );
    }

    // 3️⃣ Check if all items from this sale are fully returned
    const checkRes = await client.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM pharmacy_sale_detail WHERE sale_id = $1) AS total_items,
        (SELECT COUNT(DISTINCT srd.medicine_id)
         FROM sale_return_detail srd
         JOIN sale_return sr ON sr.return_id = srd.return_id
         WHERE sr.sale_id = $1) AS returned_items
      `,
      [sale_id]
    );

    const { total_items, returned_items } = checkRes.rows[0];

    // If all items are returned → mark pharmacy_sale as "Returned"
    if (parseInt(total_items, 10) === parseInt(returned_items, 10)) {
      await client.query(
        `UPDATE pharmacy_sale SET status = 'Returned' WHERE sale_id = $1`,
        [sale_id]
      );
    }

    // ✅ Commit transaction if everything succeeded
    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Medicines returned successfully",
        return_id,
      },
      { status: 200 }
    );
  } catch (err: any) {
    // ❌ Rollback all changes if something fails
    await client.query("ROLLBACK");
    console.error("Return API Error:", err);

    return NextResponse.json(
      { success: false, error: err.message || "Failed to return medicines" },
      { status: 500 }
    );
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}
