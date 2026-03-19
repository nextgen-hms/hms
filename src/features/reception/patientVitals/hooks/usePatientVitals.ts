// features/patient-vitals/hooks/usePatientVitals.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { usePatient } from "@/contexts/PatientIdContext";
import {
  fetchPatientVitals,
  createPatientVitals,
  updatePatientVitals,
} from "../api";
import { PatientVitals } from "../types";

const PatientVitalsSchema = z.object({
  patient_id: z.string().min(1, "Patient Id is required"),
  visit_id: z.string().optional(),
  blood_pressure: z.string().min(1, "Blood Pressure is required"),
  heart_rate: z.string().optional(),
  temperature: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  blood_group: z.string().optional(),
});

export type PatientVitalsForm = z.infer<typeof PatientVitalsSchema>;

export function usePatientVitals() {
  const { patientId, selectedVisitId, setPatientId } = usePatient();
  const [mode, setMode] = useState<"create" | "update">("create");
  const [statusMessage, setStatusMessage] = useState("Select a queued visit to record vitals.");
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientVitalsForm>({
    resolver: zodResolver(PatientVitalsSchema),
  });

  const getPatientInfo = useCallback(async () => {
    reset({
      blood_group: "",
      blood_pressure: "",
      temperature: "",
      heart_rate: "",
      height: "",
      weight: "",
      patient_id: patientId || "",
      visit_id: selectedVisitId || "",
    });

    try {
      if(!selectedVisitId) return;
      const data = await fetchPatientVitals(selectedVisitId);
      setMode("update");
      setStatusMessage(`Loaded vitals for visit #${selectedVisitId}.`);
      reset({
        ...data,
        patient_id: patientId || "",
        visit_id: selectedVisitId,
      });
    } catch {
      setMode("create");
      setStatusMessage(`No vitals recorded yet for visit #${selectedVisitId}.`);
    }
  }, [patientId, reset, selectedVisitId]);

  useEffect(() => {
    if (!selectedVisitId) {
      setMode("create");
      setStatusMessage("Select a queued visit to record vitals.");
      reset({
        blood_group: "",
        blood_pressure: "",
        temperature: "",
        heart_rate: "",
        height: "",
        weight: "",
        patient_id: patientId || "",
        visit_id: "",
      });
      return;
    }
    getPatientInfo();
  }, [selectedVisitId, patientId, reset, getPatientInfo]);

  async function addPatient(data: Omit<PatientVitals, "visit_id">) {
    try {
      if (!selectedVisitId) {
        toast.error("Select a queued visit first");
        return;
      }
      await createPatientVitals({ ...data, visit_id: selectedVisitId, patient_id: patientId || undefined });
      setMode("update");
      setStatusMessage(`Vitals saved for visit #${selectedVisitId}.`);
      toast.success("Patient vitals added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add vitals");
    }
  }

  async function updateInfo(data: Omit<PatientVitals, "visit_id">) {
    try {
      if (!selectedVisitId) {
        toast.error("Select a queued visit first");
        return;
      }
      await updatePatientVitals({ ...data, visit_id: selectedVisitId, patient_id: patientId || undefined });
      setStatusMessage(`Vitals updated for visit #${selectedVisitId}.`);
      toast.success("Patient vitals updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update vitals");
    }
  }

  return {
    patientId,
    selectedVisitId,
    setPatientId,
    register,
    handleSubmit,
    errors,
    addPatient,
    updateInfo,
    mode,
    statusMessage,
  };
}
