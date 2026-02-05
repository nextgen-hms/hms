// features/labOrders/api.ts

import { LabOrder } from "./types";

// Fetch previous lab orders for a patient
export async function fetchPreviousLabOrders(patientId: string): Promise<LabOrder[]> {
  const res = await fetch(`/api/labTests/${patientId}`);
  if (!res.ok) throw new Error(`Failed to fetch lab orders: ${res.status}`);
  const data: LabOrder[] = await res.json();

  // Format order_date to YYYY-MM-DD
  return data.map(order => ({
    ...order,
    order_date: order.order_date.split("T")[0],
  }));
}
