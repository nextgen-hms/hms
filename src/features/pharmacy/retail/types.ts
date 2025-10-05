

export type Prescription = {
  patientId: string;
  order_date: string;
  category: string;
  generic_name: string;
  brand_name: string;
  dosage_value: string;
  frequency: string;
  duration: string;
  dosage_unit: string;
  prescribed_by: string;
  prescribed_quantity: string;
  dispensed_by?: string;
  dispensed_quantity?: string;
};
