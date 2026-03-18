import { Prescription, Visit } from "./types";

export async function fetchPastVisits(patientId: string): Promise<Visit[]> {
  const res = await fetch(`/api/doctor/past-visits/${patientId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch visits: ${res.status}`);
  }

  return res.json();
}

export async function fetchPreviousPrescriptions(
  patientId: string
): Promise<Prescription[]> {
  const res = await fetch(`/api/doctor/prescriptions/${patientId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch prescriptions: ${res.status}`);
  }

  return res.json();
}
