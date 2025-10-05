

import { Medicine, FormValues } from "./types";

export async function fetchCategories(): Promise<{ category: string }[]> {
  const res = await fetch("/api/medicine/category");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchMedicinesByCategory(category: string): Promise<Medicine[]> {
  const res = await fetch(`/api/medicine/category/${category}`);
  if (!res.ok) throw new Error(`Failed to fetch medicines for ${category}`);
  return res.json();
}

export async function createPrescription(patientId: string, prescriptions: FormValues["prescriptions"]) {
  const res = await fetch("/api/prescription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patient_id: patientId, prescriptions }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to create prescription");
  }

  return res.json();
}
