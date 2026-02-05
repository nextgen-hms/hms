// features/patient-registration/hooks/usePatientForm.ts
"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { usePatient } from "@/contexts/PatientIdContext";
import { Doctor } from "../types";
import {
  fetchDoctors,
  fetchNewClinicNo,
  fetchPatientInfo,
  fetchPatientVisit,
  updateVisitInfo,
  createVisit,
} from "../api";

export function usePatientForm() {
  const { patientId, setPatientId } = usePatient();
  const [pId, setpId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [visitReason, setVisitReason] = useState("");
  const [doctor, setDoctor] = useState("");
  const [visitType, setVisitType] = useState("");
  const [clinicNo, setClinicNo] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef, documentTitle: `QueueSlip ${patientId}` });

  // Fetch doctors + clinic no on mount
  useEffect(() => {
    async function init() {
      const [clinicNo, docs] = await Promise.all([fetchNewClinicNo(), fetchDoctors()]);
      setClinicNo(clinicNo);
      setDoctors(docs);
    }
    init();
  }, []);

  useEffect(() => {
    if (!patientId) return;
    setpId(patientId);
    getPatientInfo();
  }, [patientId]);

  async function getPatientInfo() {
    try {
        if (!patientId) return;
      const data = await fetchPatientInfo(patientId);
      setPatientName(data.patient_name);
      setAge(data.age);
      setGender(data.gender);
      toast.success("Patient Found");
      await getPatientVisitInfo();
    } catch {
      toast.error("Patient not found");
    }
  }

  async function getPatientVisitInfo() {
    try {
        if (!patientId) return;
      const data = await fetchPatientVisit(patientId);
      if (data.clinic_number) {
        setVisitReason(data.reason);
        setDoctor(data.doctor_id);
        setVisitType(data.visit_type);
        setClinicNo(data.clinic_number);
      } else {
        throw new Error();
      }
    } catch {
      toast.error("No visit found for today");
      // resetInfo(false);
    }
  }

  async function addToQueue() {
    if (!visitReason || !doctor || !visitType) {
      toast.error("Incomplete form");
      return;
    }
    await createVisit({
      patient_id: patientId,
      clinic_number: clinicNo,
      reason: visitReason,
      doctor_id: doctor,
      visit_type: visitType,
    });
    toast.success("Patient added to queue");
  }

  async function updateInfo() {
    const res = await updateVisitInfo({
      clinic_number: clinicNo,
      reason: visitReason,
      doctor_id: doctor,
      visit_type: visitType,
      status: "waiting",
      patient_id: patientId,
    });
    res.ok ? toast.success(`P000${patientId} updated`) : toast.error(`Update failed`);
  }

  function resetInfo(full = true) {
    if (full) setPatientId("");
    setPatientName("");
    setAge("");
    setGender("");
    setDoctor("");
    setVisitReason("");
    setVisitType("");
    fetchNewClinicNo().then(setClinicNo);
  }

  return {
    pId, setpId,
    patientName, setPatientName,
    age, setAge,
    gender, setGender,
    visitReason, setVisitReason,
    doctor, setDoctor,
    visitType, setVisitType,
    clinicNo, doctors,
    getPatientInfo, addToQueue, updateInfo, resetInfo,
    reactToPrintFn, contentRef,
    patientId, setPatientId,
  };
}
