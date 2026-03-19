
export type Medicine = {
  sale_id: number;
  sale_detail_id: number;
  prescription_medicine_id: number | null;
  medicine_id: number;
  brand_name: string;
  generic_name: string;
  dosage_value: number;
  dosage_unit: string;
  form: string;
  frequency: string;
  duration: number;
  prescribed_quantity: string;
  dispensed_quantity: number;
  instructions: string;
  prescribed_by: string;
  dispensed_by: string;
  order_date: string;
  batch_id: number | null;
  batch_number?: string | null;
  quantity: number;
  sub_quantity: number;
  unit_sale_price: number;
  sub_unit_sale_price: number;
  line_total: number;
  reason_code?: string | null;
  reason_note?: string | null;
};
