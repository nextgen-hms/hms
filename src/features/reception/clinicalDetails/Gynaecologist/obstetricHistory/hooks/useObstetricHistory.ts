import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getObstetricHistory, addObstetricHistory, updateObstetricHistory } from "../api";

export const useObstetricHistory = (patientId: string | null, reset: (data: any) => void) => {
  const [hasRecord, setHasRecord] = useState(false);
  const [statusMessage, setStatusMessage] = useState("No obstetric history record loaded.");

  const fetchHistory = useCallback(async () => {
    if (!patientId) return;
    try {
      const data = await getObstetricHistory(patientId);
      if (data) {
        setHasRecord(true);
        setStatusMessage("Existing obstetric history loaded.");
        reset({
          ...data,
          last_menstrual_cycle: data.last_menstrual_cycle?.split("T")[0],
          edd: data.edd?.split("T")[0],
        });
      } else {
        setHasRecord(false);
        setStatusMessage("No obstetric history exists yet for this patient.");
      }
    } catch (err: any) {
      setHasRecord(false);
      setStatusMessage("Failed to load obstetric history.");
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
      await addObstetricHistory(formData);
      toast.success("Obstetric history added successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    }
  }

  async function updateInfo(data: any) {
    if (!patientId) return;
    const formData = { ...data, patient_id: patientId };
    try {
      await updateObstetricHistory(formData);
      toast.success("Obstetric history updated successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    }
  }

  return { fetchHistory, addInfo, updateInfo, hasRecord, statusMessage };
};
