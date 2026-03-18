"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePatient } from "@/contexts/PatientIdContext";
import {
  PatientContextSummary,
  DoctorProfile,
  RecentPrescription,
  RecentVisit,
} from "../types";
import * as api from "../api";

export function usePatientForm() {
  const { patientId } = usePatient();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [contextSummary, setContextSummary] = useState<PatientContextSummary | null>(null);
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<RecentPrescription[]>([]);
  const [reasonDraft, setReasonDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDoctor() {
      try {
        const profile = await api.fetchDoctorProfile();
        setDoctor(profile);
      } catch (err) {
        console.error(err);
      }
    }

    loadDoctor();
  }, []);

  useEffect(() => {
    async function loadPatientContext() {
      if (!patientId) {
        setContextSummary(null);
        setRecentVisits([]);
        setRecentPrescriptions([]);
        setReasonDraft("");
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [summary, visits, prescriptions] = await Promise.all([
          api.fetchPatientContextSummary(patientId),
          api.fetchPastVisits(patientId).catch(() => []),
          api.fetchPreviousPrescriptions(patientId).catch(() => []),
        ]);

        setContextSummary(summary);
        setRecentVisits(
          visits.filter((item) => item.visit_id !== summary.activeVisit.visit_id).slice(0, 3)
        );
        setRecentPrescriptions(prescriptions.slice(0, 4));
        setReasonDraft(summary.activeVisit.reason ?? "");
      } catch (err) {
        console.error(err);
        const message =
          err instanceof Error ? err.message : "Failed to load patient visit";
        setContextSummary(null);
        setRecentVisits([]);
        setRecentPrescriptions([]);
        setReasonDraft("");
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadPatientContext();
  }, [patientId]);

  async function saveVisitReason() {
    if (!contextSummary?.activeVisit) return;

    setIsSaving(true);
    try {
      const updatedVisit = await api.patchVisitInfo(contextSummary.activeVisit.visit_id, {
        reason: reasonDraft,
      });

      setContextSummary((current) =>
        current
          ? {
              ...current,
              activeVisit: { ...current.activeVisit, ...updatedVisit },
            }
          : current
      );
      toast.success("Visit details updated");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update visit");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleVisitStatus(nextSeen: boolean) {
    if (!contextSummary?.activeVisit) return;

    setIsSaving(true);
    try {
      const nextStatus = nextSeen ? "seen_by_doctor" : "waiting";
      const response = await api.updateVisitStatus(contextSummary.activeVisit.visit_id, nextStatus);
      setContextSummary((current) =>
        current
          ? {
              ...current,
              activeVisit: { ...current.activeVisit, ...response.visit },
            }
          : current
      );
      window.dispatchEvent(new Event("refresh-queue"));
      toast.success("Visit status updated");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    doctor,
    contextSummary,
    recentVisits,
    recentPrescriptions,
    reasonDraft,
    setReasonDraft,
    isLoading,
    isSaving,
    error,
    saveVisitReason,
    toggleVisitStatus,
  };
}
