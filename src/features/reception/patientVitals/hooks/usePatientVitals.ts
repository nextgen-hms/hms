// features/patient-vitals/hooks/usePatientVitals.ts
"use client";

import { useEffect, useState } from "react";
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
  blood_pressure: z.string().min(1, "Blood Pressure is required"),
  heart_rate: z.string().optional(),
  temperature: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  blood_group: z.string().optional(),
});

export type PatientVitalsForm = z.infer<typeof PatientVitalsSchema>;

export function usePatientVitals() {
  const { patientId, setPatientId } = usePatient();
  const [pId, setpId] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientVitalsForm>({
    resolver: zodResolver(PatientVitalsSchema),
  });

  useEffect(() => {
    if (!patientId) return;
    setpId(patientId);
    getPatientInfo();
  }, [patientId]);

  async function getPatientInfo() {
    reset({
      blood_group: "",
      blood_pressure: "",
      temperature: "",
      heart_rate: "",
      height: "",
      weight: "",
      patient_id: patientId || "",
    });

    try {
        if(!patientId) return;
      const data = await fetchPatientVitals(patientId);
      toast.success("Found patient vitals");
      reset({
        ...data,
        patient_id: patientId,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch patient vitals");
      console.error(err);
    }
  }

  async function addPatient(data: PatientVitals) {
    try {
      await createPatientVitals(data);
      toast.success("Patient vitals added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add vitals");
    }
  }

  async function updateInfo(data: PatientVitals) {
    try {
      await updatePatientVitals(data);
      toast.success("Patient vitals updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update vitals");
    }
  }

  return {
    pId,
    setpId,
    patientId,
    setPatientId,
    register,
    handleSubmit,
    errors,
    addPatient,
    updateInfo,
  };
}
