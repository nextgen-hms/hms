// features/patient-vitals/api/patientVitalsService.ts
import { PatientVitals } from "./types";

export async function fetchPatientVitals(patientId: string) {
  const res = await fetch(`/api/patientVitals/${patientId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch vitals");
  return data;
}

export async function createPatientVitals(payload: PatientVitals) {
  const res = await fetch("/api/patientVitals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail?.detail || "Failed to add vitals");
  return data;
}

export async function updatePatientVitals(payload: PatientVitals) {
  const res = await fetch("/api/patientVitals", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to update vitals");
  return data;
}
