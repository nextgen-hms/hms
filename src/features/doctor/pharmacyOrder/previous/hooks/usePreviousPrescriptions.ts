"use client"
import { useState, useEffect } from "react";
import { usePatient } from "@/contexts/PatientIdContext";
import { Prescription } from "../types";
import { fetchPreviousPrescriptions } from "../api";

export function usePreviousPrescriptions() {
  const { patientId } = usePatient();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!patientId) return;

      setLoading(true);
      try {
        const data = await fetchPreviousPrescriptions(patientId);
        setPrescriptions(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch prescriptions");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [patientId]);

  return { prescriptions, loading, error };
}
