

import { Visit, Prescription } from "./types";

// Fetch all past visits for a patient
export async function fetchPastVisits(patientId: string): Promise<Visit[]> {
  const res = await fetch(`/api/visit/${patientId}`);
  if (!res.ok) throw new Error(`Failed to fetch visits: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

// Fetch previous prescriptions for a patient
export async function fetchPreviousPrescriptions(patientId: string): Promise<Prescription[]> {
  const res = await fetch(`/api/perscription/${patientId}`);
  if (!res.ok) throw new Error(`Failed to fetch prescriptions: ${res.status}`);
  const data = await res.json();
  return data.prescriptions || [];
}
