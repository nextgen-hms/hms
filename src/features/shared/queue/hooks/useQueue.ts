"use client";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchQueue, deleteVisit } from "../api";
import { QueueItem } from "../types";

export function useQueue(queueEndpoint = "/api/queue", allowDelete = true) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [filtered, setFiltered] = useState<QueueItem[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<"ALL" | "OPD" | "Emergency">("ALL");
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchQueue(queueEndpoint);
      setQueue(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load queue");
    } finally {
      setLoading(false);
    }
  }, [queueEndpoint]);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000); // Poll every 5 seconds for more responsive UI

    const handleRefresh = () => loadQueue();
    window.addEventListener("refresh-queue", handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("refresh-queue", handleRefresh);
    };
  }, [loadQueue]);

  useEffect(() => {
    if (selectedQueue === "ALL") setFiltered(queue);
    else setFiltered(queue.filter((d) => d.visit_type === selectedQueue));
  }, [selectedQueue, queue]);

  function filterByName(name: string) {
    if (!name) setFiltered(queue);
    else setFiltered(queue.filter((q) => q.patient_name.toLowerCase().includes(name.toLowerCase())));
  }

  async function handleDelete(visitId: string | number) {
    if (!allowDelete) return;

    try {
      await deleteVisit(String(visitId));
      setQueue((prev) => prev.filter((q) => String(q.visit_id) !== String(visitId)));
      toast.success(`Deleted visit #${visitId}`);
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
    allowDelete,
  };
}
