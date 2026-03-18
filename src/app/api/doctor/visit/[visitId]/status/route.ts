import pool from "@/database/db";
import { getAuthenticatedDoctor } from "@/src/lib/server/doctor";
import { NextRequest, NextResponse } from "next/server";

const allowedStatuses = new Set(["waiting", "seen_by_doctor"]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ visitId: string }> }
) {
  const client = await pool.connect();

  try {
    const doctor = await getAuthenticatedDoctor(req);
    const { visitId } = await params;
    const body = await req.json();
    const status = String(body.status ?? "");

    if (!allowedStatuses.has(status)) {
      return NextResponse.json({ error: "Invalid visit status" }, { status: 400 });
    }

    await client.query("BEGIN");

    const visitResult = await client.query(
      `
        select visit_id, doctor_id, status
        from visit
        where visit_id = $1
          and doctor_id = $2
          and is_deleted = false
        limit 1
      `,
      [Number(visitId), doctor.doctor_id]
    );

    if (visitResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Visit not found for this doctor" },
        { status: 404 }
      );
    }

    const updatedVisit = await client.query(
      `
        update visit
        set status = $1
        where visit_id = $2
        returning visit_id, patient_id, doctor_id, visit_type, clinic_number, status, reason
      `,
      [status, Number(visitId)]
    );

    const historyResult = await client.query(
      `
        insert into visit_status_history (visit_id, status, updated_by_doctor, updated_by_staff)
        values ($1, $2, $3, $4)
        returning *
      `,
      [Number(visitId), status, doctor.doctor_id, null]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        visit: updatedVisit.rows[0],
        history: historyResult.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to update doctor visit status";
    const status = message === "Not authenticated" ? 401 : 403;
    return NextResponse.json({ error: message }, { status });
  } finally {
    client.release();
  }
}
