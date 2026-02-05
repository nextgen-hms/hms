import { useEffect } from "react";
import toast from "react-hot-toast";
import { getMenstrualHistory, addMenstrualHistory, updateMenstrualHistory } from "../api";

export const useMenstrualHistory = (patientId: string | null, reset: (data: any) => void) => {

  useEffect(() => {
    if (patientId) fetchHistory();
  }, [patientId]);

  async function fetchHistory() {
    if (!patientId) return;
    try {
      const data = await getMenstrualHistory(patientId);
      toast.success("Successfully fetched menstrual history");
      reset(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    }
  }

  async function addInfo(data: any) {
    if (!patientId) return;
    const formData = { ...data, patient_id: patientId };
    try {
      await addMenstrualHistory(formData);
      toast.success("Menstrual history added successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    }
  }

  async function updateInfo(data: any) {
    if (!patientId) return;
    const formData = { ...data, patient_id: patientId };
    try {
      await updateMenstrualHistory(formData);
      toast.success("Menstrual history updated successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    }
  }

  return { fetchHistory, addInfo, updateInfo };
};
