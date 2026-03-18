import { query } from "@/database/db";
import { getAuthenticatedDoctor } from "@/src/lib/server/doctor";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const doctor = await getAuthenticatedDoctor(req);
    const { patientId } = await params;

    const visitResult = await query(
      `
        select
          v.visit_id,
          v.patient_id,
          v.doctor_id,
          v.visit_timestamp,
          v.visit_type,
          v.clinic_number,
          v.status,
          v.reason,
          d.doctor_name
        from visit v
        join doctor d on d.doctor_id = v.doctor_id
        where v.patient_id = $1
          and v.doctor_id = $2
          and v.visit_timestamp >= current_date
          and v.visit_timestamp < current_date + interval '1 day'
          and v.is_deleted = false
          and v.status not in ('completed', 'discharged')
        order by v.visit_timestamp desc
        limit 1
      `,
      [patientId, doctor.doctor_id]
    );

    if (visitResult.rows.length === 0) {
      return NextResponse.json(
        { error: "No active visit found for this doctor and patient" },
        { status: 404 }
      );
    }

    return NextResponse.json(visitResult.rows[0], { status: 200 });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch doctor visit";
    const status = message === "Not authenticated" ? 401 : 403;
    return NextResponse.json({ error: message }, { status });
  }
}
