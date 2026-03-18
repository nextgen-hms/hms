"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { usePatient } from "@/contexts/PatientIdContext";
import * as api from "../api";
import {
  CheckedPatientRow,
  DashboardSummary,
  VisitHistoryResponse,
} from "../types";

function getToday() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function useDoctorDashboard() {
  const { setPatientVisit } = usePatient();
  const today = useMemo(() => getToday(), []);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [checkedPatients, setCheckedPatients] = useState<CheckedPatientRow[]>([]);
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [visitHistory, setVisitHistory] = useState<VisitHistoryResponse | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      setLoadingSummary(true);

      try {
        const range = { from: fromDate, to: toDate };
        const [summaryData, checkedData] = await Promise.all([
          api.fetchDashboardSummary(range),
          api.fetchCheckedPatients(range),
        ]);

        setSummary(summaryData);
        setCheckedPatients(checkedData);
        setSelectedVisitId((current) =>
          current && checkedData.some((row) => row.visit_id === current)
            ? current
            : checkedData[0]?.visit_id ?? null
        );
      } catch (error) {
        console.error(error);
        toast.error("Failed to load doctor dashboard");
      } finally {
        setLoadingSummary(false);
      }
    }

    loadDashboardData();

    const handleRefresh = () => loadDashboardData();
    window.addEventListener("refresh-queue", handleRefresh);
    return () => window.removeEventListener("refresh-queue", handleRefresh);
  }, [fromDate, toDate]);

  useEffect(() => {
    async function loadVisitHistory() {
      if (!selectedVisitId) {
        setVisitHistory(null);
        return;
      }

      setLoadingHistory(true);
      try {
        const historyData = await api.fetchVisitHistory(selectedVisitId);
        setVisitHistory(historyData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load visit history");
      } finally {
        setLoadingHistory(false);
      }
    }

    loadVisitHistory();
  }, [selectedVisitId]);

  function openPatientDetails(row: CheckedPatientRow) {
    setPatientVisit(String(row.patient_id), String(row.visit_id));
    window.dispatchEvent(
      new CustomEvent("switch-doctor-tab", {
        detail: { tab: "patientDetails" },
      })
    );
  }

  return {
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    summary,
    checkedPatients,
    selectedVisitId,
    setSelectedVisitId,
    visitHistory,
    loadingSummary,
    loadingHistory,
    openPatientDetails,
  };
}
