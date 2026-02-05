// features/prescription/api.ts
import { Prescription } from "./types";

export async function fetchPreviousPrescriptions(patientId: string): Promise<Prescription[]> {
  const res = await fetch(`/api/prescription/${patientId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch prescriptions");
  }
  const data: Prescription[] = await res.json();
  
  // Format dates
  return data.map(d => ({
    ...d,
    order_date: d.order_date?.split("T")[0],
  }));
}
