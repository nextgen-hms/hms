import { QueueItem } from "./types";

export function sortQueueByDoctor(queue: QueueItem[]): QueueItem[] {
  return [...queue].sort((a, b) => a.doctor_name.localeCompare(b.doctor_name));
}
