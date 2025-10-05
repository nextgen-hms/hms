// features/labOrders/hooks/usePreviousLabOrders.ts

import { useState, useEffect } from "react";
import { usePatient } from "@/contexts/PatientIdContext";
import { LabOrder } from "../types";
import * as api from "../api";

export function usePreviousLabOrders() {
  const { patientId } = usePatient();
  const [previousData, setPreviousData] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      if (!patientId) return;
      try {
        setLoading(true);
        const data = await api.fetchPreviousLabOrders(patientId);
        setPreviousData(data);
      } catch (err: any) {
        console.error("Error fetching previous lab orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [patientId]);

  return { previousData, loading };
}
