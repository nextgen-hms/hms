// features/patient-registration/hooks/usePatientForm.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { usePatient } from "@/contexts/PatientIdContext";
import {
  fetchDoctors,
  fetchNewClinicNo,
  fetchPatientInfo,
  fetchPatientVisit,
  updateVisitInfo,
  createVisit,
  searchPatients,
} from "../api";
import { Doctor, Patient } from "../types";

export function usePatientForm() {
  const { patientId, setPatientId } = usePatient();
  const [pId, setpId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [searchName, setSearchName] = useState(""); // search input
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [visitReason, setVisitReason] = useState("");
  const [doctor, setDoctor] = useState("");
  const [visitType, setVisitType] = useState("");
  const [clinicNo, setClinicNo] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isExistingVisit, setIsExistingVisit] = useState(false);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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


  async function getPatientVisitInfo(id: string) {
    if (!id) return;
    try {
      const data = await fetchPatientVisit(id);
      if (data && data.clinic_number) {
        setVisitReason(data.reason);
        setDoctor(data.doctor_id);
        setVisitType(data.visit_type);
        setClinicNo(data.clinic_number);
        setIsExistingVisit(true);
      } else {
        setIsExistingVisit(false);
        setVisitReason("");
        setDoctor("");
        setVisitType("");
      }
    } catch {
      setIsExistingVisit(false);
      setVisitReason("");
      setDoctor("");
      setVisitType("");
    }
  }

  async function getPatientInfo(id: string | number) {
    if (!id) return;
    const sid = id.toString();
    try {
      const data = await fetchPatientInfo(sid);
      console.log(data);

      if (data && data.patient_id) {
        setPatientName(data.patient_name);
        setSearchName(data.patient_name); // Sync search input
        setAge(data.age);
        setGender(data.gender);
        setSearchResults([]); // Clear search after selection

        // Update local and global ID
        setpId(sid);
        setPatientId(sid);

        toast.success("Patient Found");
        await getPatientVisitInfo(sid);
      } else {
        toast.error("Patient not found");
        resetInfo(false); // Clear demographic fields but keep ID
      }
    } catch (err) {
      console.error("Fetch Patient Error:", err);
      toast.error("Error fetching patient");
      resetInfo(false);
    }
  }
  const searchByName = async (name: string) => {
    if (name.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const data = await searchPatients(name);
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };


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
    if (res.ok) {
      toast.success(`P000${patientId} updated`);
    } else {
      toast.error(`Update failed`);
    }
  }

  function resetInfo(full = true) {
    if (full) {
      setPatientId("");
      setpId("");
    }
    setPatientName("");
    setSearchName("");
    setAge("");
    setGender("");
    setDoctor("");
    setVisitReason("");
    setVisitType("");
    setIsExistingVisit(false);
    setSearchResults([]);
    fetchNewClinicNo().then(setClinicNo);
  }

  useEffect(() => {
    // If global context has an ID, and it's different from our local ID, load it
    if (patientId && patientId !== pId) {
      setpId(patientId);
      getPatientInfo(patientId);
    }
  }, [patientId]);

  return {
    pId, setpId,
    searchName, setSearchName,
    age, setAge,
    gender, setGender,
    visitReason, setVisitReason,
    doctor, setDoctor,
    visitType, setVisitType,
    clinicNo, doctors,
    searchResults, isExistingVisit, isSearching,
    getPatientInfo, searchByName, addToQueue, updateInfo, resetInfo,
    reactToPrintFn, contentRef,
    patientId, setPatientId,
  };
}
