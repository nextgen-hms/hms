// features/pastVisits/hooks/usePastVisits.ts

import { useState, useEffect } from "react";
import { usePatient } from "@/contexts/PatientIdContext";
import { Visit, Prescription } from "../types";
import * as api from "../api";

export function usePastVisits() {
  const { patientId } = usePatient();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [previousPrescriptions, setPreviousPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!patientId) return;
      try {
        setLoading(true);
        const [visitsData, prescriptionsData] = await Promise.all([
          api.fetchPastVisits(patientId),
          api.fetchPreviousPrescriptions(patientId),
        ]);
        setVisits(visitsData);
        setPreviousPrescriptions(prescriptionsData);
      } catch (err: any) {
        console.error("Error fetching past visits or prescriptions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [patientId]);

  return { visits, previousPrescriptions, loading };
}
