// features/labOrder/api.ts

import { LabTest } from "./types";

// Fetch all lab tests
export async function fetchAllLabTests(): Promise<LabTest[]> {
  const res = await fetch("/api/lab");
  if (!res.ok) throw new Error(`Failed to fetch lab tests: ${res.status}`);
  const data: LabTest[] = await res.json();
  return data;
}

// Create a new lab order
export async function createLabOrder(
  patientId: string,
  visitId: string,
  tests: { test_id?: string; urgency?: string }[]
) {
  const payload = { patient_id: patientId, visit_id: visitId, tests };
  const res = await fetch("/api/doctor/lab-orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || "Failed to create lab order");
  return data;
}
