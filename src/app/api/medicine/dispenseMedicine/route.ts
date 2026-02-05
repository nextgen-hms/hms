import  pool  from "@/database/db"; // assuming getClient() gives pg client for transactions
import { NextRequest, NextResponse } from "next/server";

/**
 * Dispense Medicines API
 *
 * Responsibilities:
 * - Insert into pharmacy_sale
 * - Update prescription_medicines with dispensed_by, dispensed_quantity
 * - Insert into pharmacy_sale_detail
 * - Insert into bill_item
 *
 * Best practices used:
 * - Database transaction (BEGIN → COMMIT/ROLLBACK)
 * - Parameterized queries (SQL injection safe)
 * - Detailed error handling
 * - Inline comments for clarity
 */

export async function POST(req: NextRequest) {
  const body = await req.json(); // incoming data = array of medicines
  const client = await pool.connect(); // get dedicated client for transaction

  try {
    // ✅ Start transaction
    await client.query("BEGIN");

    // Extract visit_id & dispensed_by from first medicine (assuming all belong to same visit)
    const { visit_id, dispensed_by } = body[0];

    // 1️⃣ Get bill_id for this visit (must exist before pharmacy_sale)
    const billResult = await client.query(
      "SELECT bill_id FROM bill WHERE visit_id = $1",
      [visit_id]
    );
    if (billResult.rowCount === 0) {
      throw new Error(`No bill found for visit_id=${visit_id}`);
    }
    const bill_id = billResult.rows[0].bill_id;

    // 2️⃣ Insert into pharmacy_sale
    const saleResult = await client.query(
      `INSERT INTO pharmacy_sale(visit_id, bill_id, handled_by, status)
       VALUES ($1, $2, $3, $4)
       RETURNING sale_id`,
      [visit_id, bill_id, dispensed_by, "Completed"]
    );
    const sale_id = saleResult.rows[0].sale_id;

    // 3️⃣ Loop through medicines
    for (const med of body) {
      // (a) Update prescription_medicines with dispensed details
      await client.query(
        `UPDATE prescription_medicines
         SET dispensed_by = $1,
             dispensed_quantity = $2,
             dispensed_at = CURRENT_TIMESTAMP
         WHERE prescription_medicine_id = $3`,
        [med.dispensed_by, med.dispensed_quantity, med.prescription_medicine_id]
      );

      // (b) Insert into pharmacy_sale_detail
      await client.query(
        `INSERT INTO pharmacy_sale_detail(sale_id, medicine_id,  qty, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          sale_id,
          med.medicine_id,
          med.dispensed_quantity,
          /* Here we assume you have medicine price in frontend or need join with medicine table */
          med.price ?? 0,
          (med.price ?? 0) * med.dispensed_quantity,
        ]
      );

      // (c) Insert into bill_item
      await client.query(
        `INSERT INTO bill_item(bill_id, description, amount, quantity, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [
          bill_id,
          med.brand_name, // item_description (e.g., "Paracetamol")
          (med.price ?? 0) * med.dispensed_quantity, // total amount
          med.dispensed_quantity,
        ]
      );
    }

    // ✅ Commit transaction
    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Medicines dispensed successfully",
      sale_id,
      bill_id,
    });
  } catch (error: any) {
    // ❌ Rollback transaction on any failure
    await client.query("ROLLBACK");
    console.error("Dispense API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to dispense medicines",
      },
      { status: 500 }
    );
  } finally {
    client.release(); // always release connection
  }
}
