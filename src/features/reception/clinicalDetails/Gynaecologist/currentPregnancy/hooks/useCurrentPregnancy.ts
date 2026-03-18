"use client";

import { useCallback, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { CurrentPregnancyFormData } from "../types";
import * as api from "../api";

export function useCurrentPregnancy(patientId: string | null, visitId: string | null) {
  const [mode, setMode] = useState<"create" | "update">("create");
  const [statusMessage, setStatusMessage] = useState("Select a queued visit to manage current pregnancy details.");

  const fetchCurrentPregnancy = useCallback(async () => {
    if (!visitId) return null;
    try {
      const data = await api.getCurrentPregnancy(visitId);
      setMode("update");
      setStatusMessage(`Loaded current pregnancy details for visit #${visitId}.`);
      return data;
    } catch {
      setMode("create");
      setStatusMessage(`No current pregnancy record found for visit #${visitId}.`);
      return null;
    }
  }, [visitId]);

  useEffect(() => {
    if (patientId && visitId) {
      fetchCurrentPregnancy();
    } else {
      setMode("create");
      setStatusMessage("Select a queued visit to manage current pregnancy details.");
    }
  }, [patientId, visitId, fetchCurrentPregnancy]);

  async function addInfo(data: CurrentPregnancyFormData) {
    if (!patientId || !visitId) {
      toast.error("Select a queued visit first");
      return;
    }
    const formData = { ...data, patient_id: patientId, visit_id: visitId };
    try {
      await api.postCurrentPregnancy(formData);
      setMode("update");
      setStatusMessage(`Current pregnancy details saved for visit #${visitId}.`);
      toast.success("Current Pregnancy added successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add current pregnancy");
    }
  }

  async function updateInfo(data: CurrentPregnancyFormData) {
    if (!patientId || !visitId) {
      toast.error("Select a queued visit first");
      return;
    }
    const formData = { ...data, patient_id: patientId, visit_id: visitId };
    try {
      await api.updateCurrentPregnancy(formData);
      setStatusMessage(`Current pregnancy details updated for visit #${visitId}.`);
      toast.success("Current Pregnancy updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update current pregnancy");
    }
  }

  return { fetchCurrentPregnancy, addInfo, updateInfo, mode, statusMessage };
}
