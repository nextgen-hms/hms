
import { ApiResponse, Medicine } from "@/src/lib/types";
import { MedicineSearchResult } from "./types";

type PrescriptionCreateItem = {
  medicine_id: string;
  dosage: string;
  instructions: string;
  prescribed_quantity: number;
  dispensed_quantity: number;
  frequency: string;
  duration: string;
};

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

export async function searchMedicines(query: string): Promise<MedicineSearchResult[]> {
  const res = await fetch(`/api/medicine/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error("Failed to search medicines");
  }

  const payload: ApiResponse<{ medicines: Medicine[] }> = await res.json();
  const medicines = payload.data?.medicines ?? [];

  return medicines.map((medicine) => ({
    medicine_id: String(medicine.id),
    generic_name: medicine.generic_name,
    brand_name: medicine.brand_name,
    category: medicine.category,
    dosage_value: medicine.dosage_value,
    dosage_unit: medicine.dosage_unit,
    form: medicine.form,
    manufacturer: medicine.manufacturer,
    stock_quantity: medicine.batch_stock_quantity ?? medicine.stock_quantity,
    price: medicine.batch_sale_price ?? medicine.price,
  }));
}

export async function createPrescription(
  patientId: string,
  prescriptions: PrescriptionCreateItem[]
) {
  const res = await fetch("/api/doctor/prescriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patient_id: patientId, prescriptions }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to create prescription");
  }

  return res.json();
}
