"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePatient } from "@/contexts/PatientIdContext";
import { PatientFormData, PatientSearchResult } from "../types";
import * as api from "../api";
import toast from "react-hot-toast";

export function usePatientRegistration() {
  const { patientId, setPatientId } = usePatient();

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadedPatientId, setLoadedPatientId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await api.searchPatients(searchQuery);
      setSearchResults(results);
      setShowResults(true);
      setIsSearching(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

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
      setSearchQuery("");
      setShowResults(false);
      return data;
    }
    toast.error("Patient not found");
    return null;
  }, [setPatientId]);

  function selectSearchResult(patient: PatientSearchResult) {
    loadPatient(String(patient.patient_id));
    return String(patient.patient_id);
  }

  function clearPatient() {
    setIsEditMode(false);
    setLoadedPatientId(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
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
    // Edit mode
    isEditMode,
    loadedPatientId,
    // Search
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showResults,
    setShowResults,
    selectSearchResult,
    // Actions
    loadPatient,
    clearPatient,
    addPatient,
    updateInfo,
  };
}
