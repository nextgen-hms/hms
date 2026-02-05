

export type LabOrder = {
  order_id: number;
  test_name: string;
  category: string;
  price: number;
  status: string;
  ordered_by: string;
  performed_by: string | null;
  order_date: string;
};
