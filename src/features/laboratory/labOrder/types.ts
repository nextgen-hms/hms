export interface Test {
  patient_id: number;
  patient_name: string;
  age: number;
  gender: string;
  visit_id: number;
  order_id: number;
  urgency: string;
  status: string;
  test_id: number;
  test_name: string;
  category: string;
  ordered_by: string;
  performed_by: string;
  order_date: string;
  total_orders_in_visit: number;
}

export interface OrderItem {
  order_id: number;
  test_id: number;
  order_date: string;
  test_name: string;
  category: string;
  status: string;
  urgency: string;
  ordered_by: string;
  performed_by: string;
}

export interface GroupedPatientOrders {
  patient_id: number;
  patient_name: string;
  age: number;
  gender: string;
  total_orders: number;
  orders: OrderItem[];
}
