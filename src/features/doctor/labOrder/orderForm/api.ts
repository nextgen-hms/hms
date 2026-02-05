// features/labOrder/api.ts

import { LabTest } from "./types";

// Fetch all lab tests
export async function fetchAllLabTests(): Promise<LabTest[]> {
  const res = await fetch("/api/labTests/getallLabtests");
  if (!res.ok) throw new Error(`Failed to fetch lab tests: ${res.status}`);
  const data: LabTest[] = await res.json();
  return data;
}

// Create a new lab order
export async function createLabOrder(patientId: string, tests: { doctor_id: number; test_id?: string }[]) {
  const payload = { patient_id: patientId, tests };
  const res = await fetch("/api/labTests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || "Failed to create lab order");
  return data;
}
