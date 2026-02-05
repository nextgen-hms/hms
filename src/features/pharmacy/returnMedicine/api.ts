

import { Medicine } from "./types";

// Fetch medicines for a patient
export async function fetchMedicines(patientId: string): Promise<Medicine[]> {
  const res = await fetch(`/api/medicine/returnMedicine/currentMeds/${patientId}`);
  if (!res.ok) throw new Error(`Failed to fetch medicines: ${res.status}`);
  const data: Medicine[] = await res.json();
  return data.map((d) => ({
    ...d,
    order_date: d.order_date?.split("T")[0],
  }));
}

// Return selected medicines
export async function returnMedicines(payload: { items: Medicine[]; reason: string; created_by: number }) {
  const res = await fetch(`/api/medicine/returnMedicine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || "Failed to return medicines");
  return data;
}
