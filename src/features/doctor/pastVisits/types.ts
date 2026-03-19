export type Visit = {
  visit_id: string;
  patient_id: string;
  patient_name: string;
  age: string | number | null;
  gender: string | null;
  clinic_number: string | number | null;
  doctor_name: string;
  status: string;
  reason: string | null;
  visit_type: string;
  visit_timestamp: string;
};

export type Prescription = {
  prescription_id: string;
  order_date: string;
  category: string;
  generic_name: string;
  brand_name: string;
  dosage: string | null;
  form: string | null;
  prescribed_quantity: number;
  dispensed_quantity: number;
  frequency: string;
  duration: string;
  instructions: string | null;
  prescribed_by: string;
  dispensed_by: string | null;
};

export type LabOrder = {
  visit_id: string;
  order_id: string;
  order_date: string;
  test_name: string;
  category: string;
  price: number;
  status: string;
  urgency: string | null;
  ordered_by: string;
  performed_by: string | null;
};
