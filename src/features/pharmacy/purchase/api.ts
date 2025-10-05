// features/pharmacy/medicinePurchase/api.ts

import { MedicinePurchaseFormType, Party, Medicine } from "./types";

// Fetch all parties (suppliers)
export async function fetchParties(): Promise<Party[]> {
  const res = await fetch("/api/party");
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch parties");
  return data;
}

// Fetch all medicines
export async function fetchMedicines(): Promise<Medicine[]> {
  const res = await fetch("/api/medicine");
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch medicines");
  return data;
}

// Post a new medicine purchase
export async function postMedicinePurchase(data: MedicinePurchaseFormType) {
  const res = await fetch("/api/medicine_purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to save purchase");
  return result;
}
