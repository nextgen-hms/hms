import { PatientFormData } from "./types";

export async function getPatient(patient_id: string) {
  const res = await fetch(`/api/patient/${patient_id}`);
  return res.json();
}

export async function addPatient(data: PatientFormData) {
  const res = await fetch("/api/patient", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePatient(data: PatientFormData) {
  const res = await fetch("/api/patient", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.json();
}
