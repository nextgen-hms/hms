import { QueueItem } from "./types";

const BASE_URL = "/api/queue";

export async function fetchQueue(): Promise<QueueItem[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch queue");
  return res.json();
}

export async function deleteVisit(patientId: string): Promise<void> {
  const res = await fetch(`/api/visit/${patientId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete visit");
}
