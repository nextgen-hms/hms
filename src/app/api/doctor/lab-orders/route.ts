import pool from "@/database/db";
import { getAuthenticatedDoctor } from "@/src/lib/server/doctor";
import { NextRequest, NextResponse } from "next/server";

type LabOrderPayload = {
  test_id: string | number;
  urgency?: string;
};

export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const doctor = await getAuthenticatedDoctor(req);
    const { patient_id, tests } = await req.json();

    if (!patient_id || !Array.isArray(tests) || tests.length === 0) {
      return NextResponse.json({ error: "Invalid lab order payload" }, { status: 400 });
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
    const insertedOrders = [];

    for (const test of tests as LabOrderPayload[]) {
      const orderResult = await client.query(
        `
          insert into lab_order (visit_id, test_id, ordered_by, status, urgency)
          values ($1, $2, $3, $4, $5)
          returning *
        `,
        [
          visitId,
          Number(test.test_id),
          doctor.doctor_id,
          "Pending",
          test.urgency ?? "Routine",
        ]
      );

      insertedOrders.push(orderResult.rows[0]);
    }

    await client.query("COMMIT");

    return NextResponse.json(
      { visit_id: visitId, orders: insertedOrders },
      { status: 201 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to create lab orders";
    const status = message === "Not authenticated" ? 401 : 403;
    return NextResponse.json({ error: message }, { status });
  } finally {
    client.release();
  }
}
