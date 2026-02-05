
"use client"
import { useState, useEffect } from "react";
import { Medicine } from "../types";
import * as api from "../api";
import { usePatient } from "@/contexts/PatientIdContext";
import toast from "react-hot-toast";

export function useReturnMedicine() {
  const { patientId, setPatientId } = usePatient();
  const [pId, setpId] = useState<string>("");
  const [data, setData] = useState<Medicine[]>([]);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
            
  const getMedicines = async () => {
    try {
      setLoading(true);
      if(!patientId) return;
      const meds = await api.fetchMedicines(patientId);
      setData(meds);
      setSelected(new Array(meds.length).fill(true));
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch dispensed medicines.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (index: number) => {
    const updated = [...selected];
    updated[index] = !updated[index];
    setSelected(updated);
    setSelectAll(updated.every(Boolean));
  };

  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setSelected(new Array(data.length).fill(newValue));
  };

  const returnMedicine = async () => {
    const medicinesToReturn = data.filter((_, idx) => selected[idx]);
    if (medicinesToReturn.length === 0) {
      toast.error("No medicines selected to return.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please enter a reason for return.");
      return;
    }

    try {
      setLoading(true);
      const payload = { items: medicinesToReturn, reason, created_by: 1 };
      await api.returnMedicines(payload);
      toast.success("Medicines returned successfully.");
      setReason("");
      getMedicines();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to return medicines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      setpId(patientId);
      getMedicines();
    }
  }, [patientId]);

  return {
    pId,
    setpId,
    data,
    selected,
    selectAll,
    setPatientId,
    loading,
    reason,
    setReason,
    handleCheckboxChange,
    handleSelectAll,
    returnMedicine,
    getMedicines,
  };
}
