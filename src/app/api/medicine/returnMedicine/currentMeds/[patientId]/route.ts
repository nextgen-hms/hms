import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/medicine/returnMedicine/currentMeds/:patientId
 *
 * Fetches dispensed medicines of patient's latest visit
 * with sale info required for a return operation.
 *
 * Business Logic:
 * ✅ Only medicines from latest visit
 * ✅ Only those actually dispensed (dispensed_quantity > 0)
 * ✅ Include sale_id + unit_price (needed for POST return)
 * ✅ No duplicates (DISTINCT ON prescription_medicine_id)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { patientId: string } }
) {
  const id = (await params).patientId;

  try {
    // 1️⃣ Get latest visit_id for the patient
    const visitRes = await query(
      `SELECT visit_id
       FROM visit
       WHERE patient_id = $1
       ORDER BY visit_timestamp DESC
       LIMIT 1;`,
      [id]
    );

    if (visitRes.rows.length === 0) {
      return NextResponse.json(
        { message: "No visits found for this patient" },
        { status: 404 }
      );
    }

    const latestVisitId = visitRes.rows[0].visit_id;
    console.log(latestVisitId);
    
    // 2️⃣ Fetch only dispensed medicines for that visit (unique)
   const medsRes = await query(
  `
  SELECT DISTINCT ON (m.medicine_id)
    pm.prescription_medicine_id,
    ps.visit_id,
    m.medicine_id,
    m.brand_name,
    m.generic_name,
    m.dosage_value,
    m.dosage_unit,
    m.form,
    pm.frequency,
    pm.duration,
    pm.prescribed_quantity,
    pm.dispensed_quantity ,
    pm.instructions,
    d.doctor_name AS prescribed_by,
    COALESCE(s.name, 'N/A') AS dispensed_by,
    p.created_at::date AS order_date,
    ps.sale_id,
    psd.unit_price
FROM prescription p
JOIN prescription_medicines pm 
  ON p.prescription_id = pm.prescription_id
JOIN medicine m 
  ON m.medicine_id = pm.medicine_id
JOIN doctor d 
  ON d.doctor_id = p.doctor_id
LEFT JOIN staff s 
  ON s.staff_id = pm.dispensed_by
JOIN pharmacy_sale ps 
  ON ps.visit_id = p.visit_id
JOIN pharmacy_sale_detail psd
  ON psd.sale_id = ps.sale_id
 AND psd.medicine_id = pm.medicine_id
WHERE p.visit_id = $1
  AND pm.dispensed_quantity > 0
ORDER BY m.medicine_id, ps.sale_id ASC;

  `,
  [latestVisitId]
);


    return NextResponse.json(medsRes.rows, { status: 200 });
  } catch (err) {
    console.error("Error fetching returnable medicines:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
