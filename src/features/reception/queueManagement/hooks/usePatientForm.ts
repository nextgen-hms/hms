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
  const [searchQuery, setSearchQuery] = useState(""); // Unified search for ID or Name
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [visitReason, setVisitReason] = useState("");
  const [doctor, setDoctor] = useState("");
  const [visitType, setVisitType] = useState("OPD");
  const [clinicNo, setClinicNo] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isExistingVisit, setIsExistingVisit] = useState(false);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef, documentTitle: `QueueSlip ${patientId}` });

  // Fetch doctors on mount
  useEffect(() => {
    async function init() {
      const docs = await fetchDoctors();
      setDoctors(docs);
    }
    init();
  }, []);

  // Fetch clinic no when visit type changes
  useEffect(() => {
    if (!visitType) return;
    fetchNewClinicNo(visitType).then(setClinicNo);
  }, [visitType]);

  // Debounced Search Effect
  useEffect(() => {
    setHighlightedIndex(-1);
    // If the searchQuery is exactly the same as the already loaded patient description, don't search again
    if (searchQuery.length < 2 || searchQuery === patientName) {
      setSearchResults([]);
      return;
    }

    const handler = setTimeout(() => {
      // If it's purely digits, it might be an ID - we can still search it 
      // but usually ID lookups are exact. For now, we search everything.
      searchByName(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);


  async function getPatientVisitInfo(id: string) {
    if (!id) return;
    try {
      const data = await fetchPatientVisit(id);
      if (data && data.clinic_number) {
        setVisitReason(data.reason);
        setDoctor(data.doctor_id);
        setVisitType(data.visit_type || "OPD");
        setClinicNo(data.clinic_number);
        setIsExistingVisit(true);
      } else {
        setIsExistingVisit(false);
        setVisitReason("");
        setDoctor("");
        setVisitType("OPD");
      }
    } catch {
      setIsExistingVisit(false);
      setVisitReason("");
      setDoctor("");
      setVisitType("OPD");
    }
  }

  async function getPatientInfo(id: string | number) {
    if (!id) return;
    const sid = id.toString();
    try {
      const data = await fetchPatientInfo(sid);
      console.log(data);

      if (data && data.patient_id) {
        setPatientName(data.patient_name || "");
        setAge(data.age != null ? String(data.age) : "");
        setGender(data.gender || "");
        setSearchResults([]); // Clear search after selection
        setHighlightedIndex(-1);

        // Update local and global ID
        const displayName = data.patient_name || sid;
        setSearchQuery(displayName);
        setPatientName(displayName); // Set this so the effect can skip searching this specific name
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


  async function addToQueue(idOverride?: string) {
    const targetId = idOverride || patientId;
    if (!targetId || !visitReason || !doctor || !visitType) {
      toast.error(targetId ? "Incomplete form" : "Please select a patient");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await createVisit({
        patient_id: targetId,
        clinic_number: clinicNo,
        reason: visitReason,
        doctor_id: doctor,
        visit_type: visitType,
      });

      if (res.ok) {
        toast.success("Patient added to queue");
        // Dispatch instant UI refresh event
        window.dispatchEvent(new Event("refresh-queue"));
        // Reset form for next patient
        resetInfo(true);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to add to queue");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setIsProcessing(false);
    }
  }

  async function updateInfo() {
    setIsProcessing(true);
    try {
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
        if (patientId) await getPatientVisitInfo(patientId);
      } else {
        toast.error(`Update failed`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setIsProcessing(false);
    }
  }

  function resetInfo(full = true) {
    if (full) {
      setPatientId("");
      setSearchQuery("");
    }
    setPatientName("");
    setSearchQuery("");
    setAge("");
    setGender("");
    setDoctor("");
    setVisitReason("");
    setVisitType("OPD");
    setIsExistingVisit(false);
    setSearchResults([]);
    setHighlightedIndex(-1);
  }

  useEffect(() => {
    // If global context has an ID, and it's different from our local ID, load it
    if (patientId && patientId !== searchQuery) {
      setSearchQuery(patientId);
      getPatientInfo(patientId);
    }
  }, [patientId]);

  return {
    searchQuery, setSearchQuery,
    age, setAge,
    gender, setGender,
    visitReason, setVisitReason,
    doctor, setDoctor,
    visitType, setVisitType,
    clinicNo, doctors, patientName,
    searchResults, highlightedIndex, setHighlightedIndex, isExistingVisit, isSearching, isProcessing,
    getPatientInfo, searchByName, addToQueue, updateInfo, resetInfo,
    reactToPrintFn, contentRef,
    patientId, setPatientId,
  };
}
