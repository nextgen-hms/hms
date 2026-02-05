"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchQueue, deleteVisit } from "../api";
import { QueueItem } from "../types";

export function useQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [filtered, setFiltered] = useState<QueueItem[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<"ALL" | "OPD" | "Emergency">("ALL");
  const [loading, setLoading] = useState(true);

  async function loadQueue() {
    setLoading(true);
    try {
      const data = await fetchQueue();
      setQueue(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedQueue === "ALL") setFiltered(queue);
    else setFiltered(queue.filter((d) => d.visit_type === selectedQueue));
  }, [selectedQueue, queue]);

  function filterByName(name: string) {
    if (!name) setFiltered(queue);
    else setFiltered(queue.filter((q) => q.patient_name.toLowerCase().includes(name.toLowerCase())));
  }

  async function handleDelete(patientId: string) {
    try {
      await deleteVisit(patientId);
      setQueue((prev) => prev.filter((q) => q.patient_id !== patientId));
      toast.success(`Deleted visit for ${patientId}`);
    } catch {
      toast.error("Failed to delete visit");
    }
  }

  return {
    queue: filtered,
    loading,
    selectedQueue,
    setSelectedQueue,
    filterByName,
    deleteVisit: handleDelete,
    refreshQueue: loadQueue,
  };
}
