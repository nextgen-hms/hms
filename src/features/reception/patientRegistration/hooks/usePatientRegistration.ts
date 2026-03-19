"use client";
import { useCallback, useEffect, useState } from "react";
import { usePatient } from "@/contexts/PatientIdContext";
import { PatientFormData } from "../types";
import * as api from "../api";
import toast from "react-hot-toast";

export function usePatientRegistration() {
  const { patientId, setPatientId } = usePatient();

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadedPatientId, setLoadedPatientId] = useState<string | null>(null);

  // Sync with context patient ID
  useEffect(() => {
    if (patientId) {
      loadPatient(patientId);
    }
  }, [patientId]);

  const loadPatient = useCallback(async (id: string) => {
    const data = await api.getPatient(id);
    if (data && !data.error) {
      setIsEditMode(true);
      setLoadedPatientId(id);
      setPatientId(id);
      return data;
    }
    toast.error("Patient not found");
    return null;
  }, [setPatientId]);

  function clearPatient() {
    setIsEditMode(false);
    setLoadedPatientId(null);
    setPatientId(null);
  }

  async function addPatient(data: PatientFormData) {
    const result = await api.addPatient(data);
    if (result.patient_id) {
      toast.success(`Patient Registered! ID: ${result.patient_id}`);
      setIsEditMode(true);
      setLoadedPatientId(result.patient_id);
      setPatientId(result.patient_id);
    } else {
      toast.error(result.error || "Failed to add patient");
    }
    return result;
  }

  async function updateInfo(data: PatientFormData) {
    if (!loadedPatientId) {
      toast.error("No patient loaded to update");
      return;
    }
    const result = await api.updatePatient(loadedPatientId, data);
    if (result.patient_id) {
      toast.success(`Patient Updated! ID: ${result.patient_id}`);
    } else {
      toast.error(result.error || "Failed to update patient");
    }
    return result;
  }

  return {
    isEditMode,
    loadedPatientId,
    loadPatient,
    clearPatient,
    addPatient,
    updateInfo,
  };
}
