// features/pastVisits/hooks/usePastVisits.ts

import { useState, useEffect } from "react";
import { usePatient } from "@/contexts/PatientIdContext";
import { LabOrder, Prescription, Visit } from "../types";
import * as api from "../api";

export function usePastVisits() {
  const { patientId } = usePatient();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [previousPrescriptions, setPreviousPrescriptions] = useState<Prescription[]>([]);
  const [previousLabOrders, setPreviousLabOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!patientId) {
        setVisits([]);
        setPreviousPrescriptions([]);
        setPreviousLabOrders([]);
        return;
      }
      try {
        setLoading(true);
        const [visitsData, prescriptionsData, labOrdersData] = await Promise.all([
          api.fetchPastVisits(patientId),
          api.fetchPreviousPrescriptions(patientId),
          api.fetchPreviousLabOrders(patientId),
        ]);
        setVisits(visitsData);
        setPreviousPrescriptions(prescriptionsData);
        setPreviousLabOrders(labOrdersData);
      } catch (err: any) {
        console.error("Error fetching past visits or prescriptions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [patientId]);

  return { visits, previousPrescriptions, previousLabOrders, loading };
}
