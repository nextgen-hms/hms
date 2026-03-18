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

    const activeVisit = visitResult.rows[0];

    const [patientResult, vitalsResult, menstrualResult, obstetricResult, currentPregnancyResult] =
      await Promise.all([
        query(
          `
            select
              patient_id,
              patient_name,
              age,
              gender,
              cnic,
              contact_number,
              address
            from patient
            where patient_id = $1
            limit 1
          `,
          [patientId]
        ),
        query("select * from patient_vitals where visit_id = $1 limit 1", [activeVisit.visit_id]),
        query(
          `
            select
              menarch_age,
              cycle_length_days,
              bleeding_days,
              menstrual_regular,
              contraception_history,
              gynecologic_surgeries,
              medical_conditions,
              menopause_status,
              notes
            from menstrual_history
            where patient_id = $1
            limit 1
          `,
          [patientId]
        ),
        query(
          `
            select
              is_first_pregnancy,
              married_years,
              gravida,
              para,
              abortions,
              edd,
              last_menstrual_cycle,
              notes
            from obstetric_history
            where patient_id = $1
            limit 1
          `,
          [patientId]
        ),
        query(
          `
            select
              multiple_pregnancy,
              complications,
              ultrasound_findings,
              fetal_heart_rate_bpm,
              placenta_position,
              presentation,
              gestational_age_weeks,
              notes
            from current_pregnancy
            where visit_id = $1
            limit 1
          `,
          [activeVisit.visit_id]
        ),
      ]);

    if (patientResult.rows.length === 0) {
      return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
    }

    const womenHealthSummary =
      menstrualResult.rows[0] || obstetricResult.rows[0] || currentPregnancyResult.rows[0]
        ? {
            menstrualHistory: menstrualResult.rows[0] ?? null,
            obstetricHistory: obstetricResult.rows[0] ?? null,
            currentPregnancy: currentPregnancyResult.rows[0] ?? null,
          }
        : null;

    return NextResponse.json(
      {
        patient: patientResult.rows[0],
        activeVisit,
        vitals: vitalsResult.rows[0] ?? null,
        womenHealthSummary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch patient context";
    const status = message === "Not authenticated" ? 401 : 403;
    return NextResponse.json({ error: message }, { status });
  }
}
