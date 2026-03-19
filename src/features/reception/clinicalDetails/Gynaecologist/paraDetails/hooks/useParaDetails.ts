// features/reception/patientRegistration/obstetricHistory/hooks/useParaDetails.ts

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { usePatient } from "@/contexts/PatientIdContext";
import { useForm } from "react-hook-form";
import { ParaDetailsFormType } from "../types";
import * as api from "../api";

export function useParaDetails() {
  const { patientId } = usePatient();
  const [obstetricHistoryId, setObstetricHistoryId] = useState<string | null>(null);
  const [hasExistingRecords, setHasExistingRecords] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Obstetric history is required before para details can be managed.");

  const methods = useForm<ParaDetailsFormType>({
    defaultValues: { para: [] },
  });

  const { reset, control } = methods;

  const fetchObstetricHistoryId = useCallback(async () => {
    try {
      const data = await api.getObstetricHistoryId(patientId!);
      if (data) {
        setObstetricHistoryId(data.obstetric_history_id);
        if (data.para && data.para.length > 0) {
          reset({ para: data.para });
          setHasExistingRecords(true);
          setStatusMessage("Existing para details loaded.");
        } else {
          reset({ para: [] });
          setHasExistingRecords(false);
          setStatusMessage("No para details exist yet for this patient.");
        }
      } else {
        setObstetricHistoryId(null);
        reset({ para: [] });
        setHasExistingRecords(false);
        setStatusMessage("Create obstetric history first to manage para details.");
      }
    } catch (err: any) {
      reset({ para: [] });
      setHasExistingRecords(false);
      setStatusMessage("Error loading obstetric history context.");
      console.error("Fetch Error:", err);
    }
  }, [patientId, reset]);

  const fetchPara = useCallback(async () => {
    
    if (!obstetricHistoryId) return;
    try {
      const paraData = await api.getPara(obstetricHistoryId);
      setHasExistingRecords(paraData.length > 0);
      setStatusMessage(paraData.length > 0 ? "Existing para details loaded." : "No para details exist yet for this patient.");
      reset({ para: paraData });
    } catch {
      setHasExistingRecords(false);
      setStatusMessage("No para details exist yet for this patient.");
    }
  }, [obstetricHistoryId, reset]);

  useEffect(() => {
    if (patientId) fetchObstetricHistoryId();
  }, [patientId, fetchObstetricHistoryId]);

  useEffect(() => {
    if (obstetricHistoryId) {
      fetchPara();
    }
  }, [obstetricHistoryId, fetchPara]);

  async function addPara(data: ParaDetailsFormType) {
    if (!obstetricHistoryId) return toast.error("Obstetric history not found");
    const formData = {
      para: data.para.map((item, index) => ({
        ...item,
        para_number: index + 1,
        obstetric_history_id: obstetricHistoryId,
      })),
    };
    try {
      await api.postPara(formData);
      setHasExistingRecords(true);
      setStatusMessage("Para details saved successfully.");
      toast.success("Para details added successfully");
      fetchPara();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function updateParaData(data: ParaDetailsFormType) {
    if (!obstetricHistoryId) return toast.error("Obstetric history not found");
    const formData = {
      para: data.para.map((item, index) => ({
        ...item,
        para_number: index + 1,
        obstetric_history_id: obstetricHistoryId,
      })),
    };
    try {
      await api.updatePara(formData);
      setHasExistingRecords(true);
      setStatusMessage("Para details updated successfully.");
      toast.success("Para details updated successfully");
      fetchPara();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return { methods, obstetricHistoryId, addPara, updateParaData, fetchPara, control, hasExistingRecords, statusMessage };
}
