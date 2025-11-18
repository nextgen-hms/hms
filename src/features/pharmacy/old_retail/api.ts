// features/pharmacy/pharmacyOrder/api.ts

import { Prescription } from "./types";

// Fetch prescriptions for a patient
export async function fetchPrescriptions(patientId: string): Promise<Prescription[]> {
  const res = await fetch(`/api/medicine/dispenseMedicine/currentMeds/${patientId}`);
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch prescriptions");
  return data.map((d: Prescription) => ({
    ...d,
    order_date: d.order_date?.split("T")[0],
  }));
}

// Dispense selected medicines
export async function dispenseMedicines(medicines: Prescription[]) {
  const res = await fetch(`/api/medicine/dispenseMedicine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(medicines),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to dispense medicines");
  return result;
}
