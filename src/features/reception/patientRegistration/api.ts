import { PatientFormData, PatientSearchResult } from "./types";

export async function getPatient(patient_id: string) {
  const res = await fetch(`/api/patient/${patient_id}`);
  return res.json();
}

export async function addPatient(data: PatientFormData) {
  const res = await fetch("/api/patient", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePatient(patient_id: string, data: PatientFormData) {
  const res = await fetch("/api/patient", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, patient_id }),
  });
  return res.json();
}

export async function searchPatients(queryStr: string): Promise<PatientSearchResult[]> {
  if (!queryStr.trim()) return [];
  const res = await fetch(`/api/patient/search?q=${encodeURIComponent(queryStr)}`);
  if (!res.ok) return [];
  return res.json();
}
