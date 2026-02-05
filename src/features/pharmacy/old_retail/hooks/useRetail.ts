"use client"
import { useEffect, useState } from "react";
import { Prescription } from "../types";
import * as api from "../api";
import { usePatient } from "@/contexts/PatientIdContext";
import toast from "react-hot-toast";

export function usePharmacyOrder() {
  const { patientId, setPatientId } = usePatient();
  const [pId, setpId] = useState<string>("");
  const [data, setData] = useState<Prescription[]>([]);
  const [dispensed, setDispensed] = useState<boolean[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(true);

  const getPrescriptions = async () => {
    if (!patientId) return;
    try {
      const prescriptions = await api.fetchPrescriptions(patientId);
      setData(prescriptions);
      setDispensed(new Array(prescriptions.length).fill(true));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleCheckboxChange = (index: number) => {
    const updated = [...dispensed];
    updated[index] = !updated[index];
    setDispensed(updated);
    setSelectAll(updated.every(Boolean));
  };

  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setDispensed(new Array(data.length).fill(newValue));
  };

  const dispenseMedicine = async () => {
    const medicinesToDispense = data.filter((_, idx) => dispensed[idx]);
    medicinesToDispense.forEach((d) => {
      d.dispensed_by = "1"; // Placeholder: pharmacist id
      d.dispensed_quantity = d.prescribed_quantity;
    });
    try {
      await api.dispenseMedicines(medicinesToDispense);
      toast.success("Medicine dispensed");
      getPrescriptions(); // Refresh
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (patientId) {
      setpId(patientId);
      getPrescriptions();
    }
  }, [patientId]);

  return {
    pId,
    setpId,
    data,
    dispensed,
    selectAll,
    setPatientId,
    handleCheckboxChange,
    handleSelectAll,
    dispenseMedicine,
    getPrescriptions,
  };
}
