"use client"
import { useCallback, useEffect, useState } from "react";
import { usePatient } from "@/contexts/PatientIdContext";
import { PatientFormData } from "../types";
import * as api from "../api";
import toast from "react-hot-toast";

export function usePatientRegistration() {
  const { patientId, setPatientId } = usePatient();
  const [pId, setpId] = useState("");

  useEffect(() => {
    if (patientId) {
      setpId(patientId);
    }
  }, [patientId]);

  const getPatientInfo = useCallback(async (id?: string) => {
    const targetId = id || pId;
    if (!targetId) return;
    const data = await api.getPatient(targetId);
    return data;
  }, [pId]);

  async function addPatient(data: PatientFormData) {
    const result = await api.addPatient(data);
    if (result.patient_id) {
      toast.success(`Patient Added! ID: ${result.patient_id}`);
      setpId(result.patient_id);
      setPatientId(result.patient_id);
    } else {
      toast.error("Failed to add patient");
    }
    return result;
  }

  async function updateInfo(data: PatientFormData) {
    const result = await api.updatePatient(data);
    if (result.patient_id) {
      toast.success(`Patient Info Updated! ID: ${result.patient_id}`);
      setpId(result.patient_id);
      setPatientId(result.patient_id);
    } else {
      toast.error("Failed to update patient info");
    }
    return result;
  }

  return {
    pId,
    setpId,
    setPatientId,
    getPatientInfo,
    addPatient,
    updateInfo,
  };
}
