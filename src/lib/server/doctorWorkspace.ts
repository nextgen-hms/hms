import type { PoolClient } from "pg";

type QueryResultRow = { [key: string]: unknown };

type QueryExecutor = (
  text: string,
  params?: unknown[]
) => Promise<{ rows: QueryResultRow[] }>;

type Queryable =
  | PoolClient
  | { query: QueryExecutor }
  | QueryExecutor;

async function runQuery(db: Queryable, text: string, params?: unknown[]) {
  if (typeof db === "function") {
    return db(text, params);
  }

  return db.query(text, params);
}

export type DoctorEncounterNoteRecord = {
  visit_id: number;
  patient_id: number;
  doctor_id: number;
  reception_complaint: string | null;
  doctor_note: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function resolveDoctorVisit(
  db: Queryable,
  {
    doctorId,
    visitId,
    patientId,
    lock = false,
  }: {
    doctorId: number;
    visitId: number;
    patientId?: number;
    lock?: boolean;
  }
) {
  const params: Array<number> = [visitId, doctorId];
  const patientFilter = patientId ? "and v.patient_id = $3" : "";

  if (patientId) {
    params.push(patientId);
  }

  const result = await runQuery(
    db,
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
      where v.visit_id = $1
        and v.doctor_id = $2
        ${patientFilter}
        and v.is_deleted = false
      limit 1
      ${lock ? "for update" : ""}
    `,
    params
  );

  return result.rows[0] ?? null;
}

export async function getDoctorEncounterNote(
  db: Queryable,
  visitId: number,
  doctorId: number
) {
  const result = await runQuery(
    db,
    `
      select
        den.visit_id,
        den.patient_id,
        den.doctor_id,
        den.reception_complaint,
        den.doctor_note,
        den.created_at::text,
        den.updated_at::text
      from doctor_encounter_note den
      join visit v on v.visit_id = den.visit_id
      where den.visit_id = $1
        and v.doctor_id = $2
        and v.is_deleted = false
      limit 1
    `,
    [visitId, doctorId]
  );

  return (result.rows[0] as DoctorEncounterNoteRecord | undefined) ?? null;
}

export async function upsertDoctorEncounterNote(
  db: Queryable,
  {
    visitId,
    doctorId,
    doctorNote,
  }: {
    visitId: number;
    doctorId: number;
    doctorNote: string;
  }
) {
  const result = await runQuery(
    db,
    `
      insert into doctor_encounter_note (
        visit_id,
        patient_id,
        doctor_id,
        reception_complaint,
        doctor_note
      )
      select
        v.visit_id,
        v.patient_id,
        v.doctor_id,
        nullif(trim(v.reason), ''),
        nullif(trim($3), '')
      from visit v
      where v.visit_id = $1
        and v.doctor_id = $2
        and v.is_deleted = false
      on conflict (visit_id) do update
      set
        doctor_note = excluded.doctor_note,
        doctor_id = excluded.doctor_id,
        updated_at = now()
      returning
        visit_id,
        patient_id,
        doctor_id,
        reception_complaint,
        doctor_note,
        created_at::text,
        updated_at::text
    `,
    [visitId, doctorId, doctorNote]
  );

  if (!result.rows[0]) {
    throw new Error("Visit not found for this doctor");
  }

  return result.rows[0] as DoctorEncounterNoteRecord;
}

export async function getDoctorVisitContext(
  db: Queryable,
  {
    doctorId,
    visitId,
    patientId,
  }: {
    doctorId: number;
    visitId: number;
    patientId?: number;
  }
) {
  const visit = await resolveDoctorVisit(db, { doctorId, visitId, patientId });

  if (!visit) {
    throw new Error("Visit not found for this doctor");
  }

  const resolvedPatientId = Number(visit.patient_id);

  const [
    patientResult,
    encounterNote,
    vitalsResult,
    menstrualResult,
    obstetricResult,
    currentPregnancyResult,
  ] = await Promise.all([
    runQuery(
      db,
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
      [resolvedPatientId]
    ),
    getDoctorEncounterNote(db, visitId, doctorId),
    runQuery(db, "select * from patient_vitals where visit_id = $1 limit 1", [visitId]),
    runQuery(
      db,
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
        order by menstrual_history_id desc
        limit 1
      `,
      [resolvedPatientId]
    ),
    runQuery(
      db,
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
        order by obstetric_history_id desc
        limit 1
      `,
      [resolvedPatientId]
    ),
    runQuery(
      db,
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
        order by pregnanacy_id desc
        limit 1
      `,
      [visitId]
    ),
  ]);

  if (!patientResult.rows[0]) {
    throw new Error("Patient record not found");
  }

  const materializedEncounterNote =
    encounterNote ??
    ({
      visit_id: Number(visit.visit_id),
      patient_id: resolvedPatientId,
      doctor_id: doctorId,
      reception_complaint: typeof visit.reason === "string" ? visit.reason : null,
      doctor_note: null,
      created_at: null,
      updated_at: null,
    } satisfies DoctorEncounterNoteRecord);

  const womenHealthSummary =
    menstrualResult.rows[0] || obstetricResult.rows[0] || currentPregnancyResult.rows[0]
      ? {
          menstrualHistory: menstrualResult.rows[0] ?? null,
          obstetricHistory: obstetricResult.rows[0] ?? null,
          currentPregnancy: currentPregnancyResult.rows[0] ?? null,
        }
      : null;

  return {
    patient: patientResult.rows[0],
    activeVisit: visit,
    encounterNote: materializedEncounterNote,
    vitals: vitalsResult.rows[0] ?? null,
    womenHealthSummary,
  };
}

export async function transitionDoctorVisitStatus(
  db: Queryable,
  {
    visitId,
    doctorId,
  }: {
    visitId: number;
    doctorId: number;
  }
) {
  const visit = await resolveDoctorVisit(db, {
    visitId,
    doctorId,
    lock: true,
  });

  if (!visit) {
    throw new Error("Visit not found for this doctor");
  }

  if (visit.status !== "waiting") {
    throw new Error("Only waiting visits can be marked as seen by doctor");
  }

  await runQuery(
    db,
    `call update_and_log_visit_status($1, $2, $3, $4)`,
    [visitId, "seen_by_doctor", doctorId, null]
  );

  const updatedVisit = await resolveDoctorVisit(db, { visitId, doctorId });

  const historyResult = await runQuery(
    db,
    `
      select *
      from visit_status_history
      where visit_id = $1
      order by visit_status_id desc
      limit 1
    `,
    [visitId]
  );

  return {
    visit: updatedVisit,
    history: historyResult.rows[0] ?? null,
  };
}

export function ensureDoctorVisitWriteAccess(status: string) {
  if (!["waiting", "seen_by_doctor"].includes(status)) {
    throw new Error("Selected visit is no longer actionable from the doctor workspace");
  }
}
