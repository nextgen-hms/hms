// features/pharmacy/medicinePurchase/types.ts

export type MedicineRow = {
  medicine_id: string;
  qty: string;
  unit_cost: string;
  batch_no: string;
  expiry_date: string;
};

export type MedicinePurchaseFormType = {
  party_id: string;
  invoice_no: string;
  payment_status: "Paid" | "Unpaid" | "Partial";
  medicines: MedicineRow[];
};

export type Party = {
  party_id: string;
  name: string;
};

export type Medicine = {
  medicine_id: string;
  brand_name: string;
  generic_name: string;
  category: string;
};
