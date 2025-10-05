
export type Prescription = {
  order_date: string;
  category: string;
  generic_name: string;
  brand_name: string;
  dosage_value: number;
  dosage_unit: string;
  instructions: string;
  prescribed_quantity: number;
  dispensed_quantity: number;
  frequency: number | string;
  duration: string;
  unit: string;
  prescribed_by: string;
  dispensed_by: string;
  form: string;
};
