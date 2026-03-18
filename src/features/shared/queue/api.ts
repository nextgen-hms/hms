import { QueueItem } from "./types";

const DEFAULT_BASE_URL = "/api/queue";

export async function fetchQueue(baseUrl = DEFAULT_BASE_URL): Promise<QueueItem[]> {
  const res = await fetch(baseUrl);
  if (!res.ok) throw new Error("Failed to fetch queue");
  return res.json();
}

export async function deleteVisit(visitId: string): Promise<void> {
  const res = await fetch(`/api/visit`, {
    method: "DELETE",
    body: JSON.stringify({ visit_id: visitId }),
  });
  if (!res.ok) throw new Error("Failed to delete visit");
}
