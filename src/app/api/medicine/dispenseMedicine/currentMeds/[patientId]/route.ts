import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/medicine/dispenseMedicine/currentMeds/:patientId
 *
 * This endpoint returns ONLY the medicines of the patient's latest visit.
 * Used by pharmacist to dispense the medicines prescribed in the most recent visit.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { patientId: string } }
) {
  const id =(await params).patientId; // Extract patientId from route
  console.log("Fetching prescriptions for patient:", id);

  try {
    // Step 1: Get the latest visit_id for this patient
    const latestVisitRes = await query(
      `SELECT visit_id
       FROM visit
       WHERE patient_id = $1
       ORDER BY visit_timestamp DESC
       LIMIT 1;`,
      [id]
    );

    if (latestVisitRes.rows.length === 0) {
      return NextResponse.json(
        { message: "No visits found for this patient" },
        { status: 404 }
      );
    }

    const latestVisitId = latestVisitRes.rows[0].visit_id;

    // Step 2: Get prescriptions + medicines ONLY for the latest visit
    const res = await query(
      `
      SELECT
        v.visit_id,
        p.prescription_id,
        pm.prescription_medicine_id,
        m.medicine_id,
        m.category,
        m.generic_name,
        m.brand_name,
        m.dosage_value,
        m.dosage_unit,
        m.form,
        m.price,
        pm.frequency,
        pm.duration,
        pm.prescribed_quantity,
        pm.dispensed_quantity,
        pm.instructions,
        d.doctor_name AS prescribed_by,
        s.name AS dispensed_by,
        p.created_at::date AS order_date
      FROM visit v
      JOIN prescription p 
        ON v.visit_id = p.visit_id
      JOIN prescription_medicines pm 
        ON p.prescription_id = pm.prescription_id
      JOIN medicine m 
        ON m.medicine_id = pm.medicine_id
      JOIN doctor d 
        ON d.doctor_id = p.doctor_id
      LEFT JOIN staff s 
        ON s.staff_id = pm.dispensed_by
      WHERE v.patient_id = $1
        AND v.visit_id = $2  -- 🚀 Only fetch the latest visit
        AND (pm.dispensed_quantity IS NULL OR pm.dispensed_quantity < pm.prescribed_quantity)
      ORDER BY pm.prescription_medicine_id ASC;
      `,
      [id, latestVisitId]
    );

    // Step 3: Return the result
    return NextResponse.json(res.rows, { status: 200 });
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
