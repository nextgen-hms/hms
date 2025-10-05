import { useEffect } from "react";
import toast from "react-hot-toast";
import { getObstetricHistory, addObstetricHistory, updateObstetricHistory } from "../api";

export const useObstetricHistory = (patientId: string | null, reset: (data: any) => void) => {

  useEffect(() => {
    if (patientId) fetchHistory();
  }, [patientId]);

  async function fetchHistory() {
    if (!patientId) return;
    try {
      const data = await getObstetricHistory(patientId);
      toast.success("Successfully fetched obstetric history");
      reset({
        ...data,
        last_menstrual_cycle: data.last_menstrual_cycle?.split("T")[0],
        edd: data.edd?.split("T")[0],
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    }
  }

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

  return { fetchHistory, addInfo, updateInfo };
};
