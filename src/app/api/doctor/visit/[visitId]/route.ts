import { query } from "@/database/db";
import { getAuthenticatedDoctor } from "@/src/lib/server/doctor";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ visitId: string }> }
) {
  try {
    const doctor = await getAuthenticatedDoctor(req);
    const { visitId } = await params;
    const body = await req.json();

    const fields: string[] = [];
    const values: Array<string | number> = [];

    if (typeof body.reason === "string") {
      fields.push(`reason = $${fields.length + 1}`);
      values.push(body.reason.trim());
    }

    if (typeof body.visit_type === "string") {
      fields.push(`visit_type = $${fields.length + 1}`);
      values.push(body.visit_type);
    }

    if (typeof body.clinic_number === "number" || typeof body.clinic_number === "string") {
      fields.push(`clinic_number = $${fields.length + 1}`);
      values.push(Number(body.clinic_number));
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: "No editable fields provided" },
        { status: 400 }
      );
    }

    values.push(Number(visitId), doctor.doctor_id);

    const updateResult = await query(
      `
        update visit
        set ${fields.join(", ")}
        where visit_id = $${fields.length + 1}
          and doctor_id = $${fields.length + 2}
          and is_deleted = false
        returning visit_id, patient_id, doctor_id, visit_type, clinic_number, status, reason
      `,
      values
    );

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Visit not found for this doctor" },
        { status: 404 }
      );
    }

    return NextResponse.json(updateResult.rows[0], { status: 200 });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to update doctor visit";
    const status = message === "Not authenticated" ? 401 : 403;
    return NextResponse.json({ error: message }, { status });
  }
}
