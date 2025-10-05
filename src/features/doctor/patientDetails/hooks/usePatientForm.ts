
import { useState, useEffect } from "react";
import { usePatient } from "@/contexts/PatientIdContext";
import { PatientInfo, VisitInfo, Doctor } from "../types";
import * as api from "../api";
import toast from "react-hot-toast";

export function usePatientForm() {
  const { patientId, setPatientId } = usePatient();
  const [pId, setpId] = useState("");
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [visitInfo, setVisitInfo] = useState<VisitInfo | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    async function fetchAllDoctors() {
      try {
        const docs = await api.fetchDoctors();
        setDoctors(docs);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch doctors");
      }
    }
    fetchAllDoctors();
  }, []);

  useEffect(() => {
    async function fetchPatientData() {
      if (!patientId) return;
      try {
        const patient = await api.fetchPatientInfo(patientId);
        setPatientInfo(patient);
        toast.success("Patient Found");
        const visit = await api.fetchVisitInfo(patientId);
        setVisitInfo(visit);
        setIsChecked(visit.status === "seen_by_doctor");
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to fetch patient data");
      }
    }
    fetchPatientData();
  }, [patientId]);

  const updateVisitInfo = async (updatedVisit: Partial<VisitInfo>) => {
    if (!patientId) return;
    try {
      await api.patchVisitInfo({ ...updatedVisit, patient_id: patientId });
      toast.success("Visit info updated");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update visit info");
    }
  };

  const updateVisitStatus = async (status: boolean) => {
    if (!visitInfo || !visitInfo.visit_id) return;
    try {
      await api.updateVisitStatusAPI(visitInfo.visit_id, status ? "seen_by_doctor" : "waiting", visitInfo.doctor_id);
      setIsChecked(status);
      toast.success("Status updated successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update status");
    }
  };

  return {
    pId,
    setpId,
    patientInfo,
    visitInfo,
    doctors,
    isChecked,
    setIsChecked,
    setPatientId,
    updateVisitInfo,
    updateVisitStatus,
  };
}
