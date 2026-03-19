import { LabOrder, Prescription, Visit } from "./types";

export async function fetchPastVisits(patientId: string): Promise<Visit[]> {
  const res = await fetch(`/api/doctor/history/patient/${patientId}/visits`);
  if (!res.ok) {
    throw new Error(`Failed to fetch visits: ${res.status}`);
  }

  return res.json();
}

export async function fetchPreviousPrescriptions(
  patientId: string
): Promise<Prescription[]> {
  const res = await fetch(`/api/doctor/history/patient/${patientId}/prescriptions`);
  if (!res.ok) {
    throw new Error(`Failed to fetch prescriptions: ${res.status}`);
  }

  return res.json();
}

export async function fetchPreviousLabOrders(patientId: string): Promise<LabOrder[]> {
  const res = await fetch(`/api/doctor/history/patient/${patientId}/lab-orders`);
  if (!res.ok) {
    throw new Error(`Failed to fetch lab orders: ${res.status}`);
  }

  return res.json();
}
