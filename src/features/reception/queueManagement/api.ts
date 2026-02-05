// features/patient-registration/api/patientService.ts
export async function fetchPatientInfo(patientId: string) {
  const res = await fetch(`/api/patient/${patientId}`);
  if (!res.ok) throw new Error("Failed to fetch patient info");
  return res.json();
}

export async function fetchPatientVisit(patientId: string) {
  const res = await fetch(`/api/visit/${patientId}`);
  if (!res.ok) throw new Error("No visit found for today");
  return res.json();
}

export async function fetchNewClinicNo() {
  const res = await fetch("/api/patient/getNewClinicNo");
  const data = await res.json();
  return data.clinicNo;
}

export async function updateVisitInfo(payload: any) {
  return fetch("/api/visit", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function createVisit(payload: any) {
  return fetch("/api/visit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchDoctors() {
  const res = await fetch("/api/doctor/getAllDoctors");
  if (!res.ok) throw new Error("Failed to fetch doctors");
  return res.json();
}

export async function searchPatients(q: string) {
  const res = await fetch(`/api/patient/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error("Failed to search patients");
  return res.json();
}
