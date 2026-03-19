import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMenstrualHistory, addMenstrualHistory, updateMenstrualHistory } from "../api";

export const useMenstrualHistory = (patientId: string | null, reset: (data: any) => void) => {
  const [hasRecord, setHasRecord] = useState(false);
  const [statusMessage, setStatusMessage] = useState("No menstrual history record loaded.");

  const fetchHistory = useCallback(async () => {
    if (!patientId) return;
    try {
      const data = await getMenstrualHistory(patientId);
      if (data) {
        setHasRecord(true);
        setStatusMessage("Existing menstrual history loaded.");
        reset(data);
      } else {
        setHasRecord(false);
        setStatusMessage("No menstrual history exists yet for this patient.");
      }
    } catch (err: any) {
      setHasRecord(false);
      setStatusMessage("Failed to load menstrual history.");
      console.error("Fetch Error:", err);
    }
  }, [patientId, reset]);

  useEffect(() => {
    if (patientId) fetchHistory();
  }, [patientId, fetchHistory]);

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

  return { fetchHistory, addInfo, updateInfo, hasRecord, statusMessage };
};
