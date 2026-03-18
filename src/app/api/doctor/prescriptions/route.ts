import pool from "@/database/db";
import { getAuthenticatedDoctor } from "@/src/lib/server/doctor";
import { NextRequest, NextResponse } from "next/server";

type PrescriptionPayload = {
  medicine_id: string | number;
  dosage: string;
  instructions: string;
  prescribed_quantity: number;
  dispensed_quantity?: number;
  frequency: string;
  duration: string;
};

export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const doctor = await getAuthenticatedDoctor(req);
    const { patient_id, prescriptions } = await req.json();

    if (!patient_id || !Array.isArray(prescriptions) || prescriptions.length === 0) {
      return NextResponse.json({ error: "Invalid prescription payload" }, { status: 400 });
    }

    await client.query("BEGIN");

    const visitResult = await client.query(
      `
        select visit_id
        from visit
        where patient_id = $1
          and doctor_id = $2
          and visit_timestamp >= current_date
          and visit_timestamp < current_date + interval '1 day'
          and is_deleted = false
        order by visit_timestamp desc
        limit 1
      `,
      [Number(patient_id), doctor.doctor_id]
    );

    if (visitResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "No active doctor-owned visit found for this patient" },
        { status: 404 }
      );
    }

    const visitId = visitResult.rows[0].visit_id;

    const existingPrescription = await client.query(
      `
        select prescription_id
        from prescription
        where visit_id = $1
        limit 1
      `,
      [visitId]
    );

    let prescriptionId = existingPrescription.rows[0]?.prescription_id;

    if (!prescriptionId) {
      const prescriptionResult = await client.query(
        `
          insert into prescription (visit_id, doctor_id)
          values ($1, $2)
          returning prescription_id
        `,
        [visitId, doctor.doctor_id]
      );

      prescriptionId = prescriptionResult.rows[0].prescription_id;
    }

    const insertedMedicines = [];

    for (const item of prescriptions as PrescriptionPayload[]) {
      const medicineResult = await client.query(
        `
          insert into prescription_medicines (
            prescription_id,
            medicine_id,
            duration,
            instructions,
            dispensed_by,
            frequency,
            prescribed_quantity,
            dispensed_quantity
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8)
          returning *
        `,
        [
          prescriptionId,
          Number(item.medicine_id),
          item.duration,
          item.instructions,
          null,
          item.frequency,
          Number(item.prescribed_quantity || 0),
          Number(item.dispensed_quantity || 0),
        ]
      );

      insertedMedicines.push(medicineResult.rows[0]);
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        prescription_id: prescriptionId,
        visit_id: visitId,
        medicines: insertedMedicines,
      },
      { status: 201 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to create prescription";
    const status = message === "Not authenticated" ? 401 : 403;
    return NextResponse.json({ error: message }, { status });
  } finally {
    client.release();
  }
}
