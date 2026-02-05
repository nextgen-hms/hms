// features/reception/patientRegistration/obstetricHistory/hooks/useParaDetails.ts

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { usePatient } from "@/contexts/PatientIdContext";
import { useForm } from "react-hook-form";
import { ParaDetailsFormType } from "../types";
import * as api from "../api";

export function useParaDetails() {
  const { patientId } = usePatient();
  const [obstetricHistoryId, setObstetricHistoryId] = useState<string | null>(null);

  const methods = useForm<ParaDetailsFormType>({
    defaultValues: { para: [] },
  });

  const { reset, control } = methods;

  useEffect(() => {
    if (patientId) fetchObstetricHistoryId();
  }, [patientId]);
useEffect(() => {
  if (obstetricHistoryId) {
    fetchPara();
  }
}, [obstetricHistoryId]);
  async function fetchObstetricHistoryId() {
    try {
      const data = await api.getObstetricHistoryId(patientId!);
      setObstetricHistoryId(data.obstetric_history_id);
      if (data.para && data.para.length > 0) {
        reset({ para: data.para });
        toast.success("Fetched para details successfully");
      } else {
        reset({ para: [] });
      }
    } catch (err: any) {
      toast.error(err.message);
      reset({ para: [] });
    }
  }

  async function fetchPara() {
    
    if (!obstetricHistoryId) return;
    try {
      const paraData = await api.getPara(obstetricHistoryId);
      console.log(paraData);
      
      reset({ para: paraData });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

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
      toast.success("Para details updated successfully");
      fetchPara();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return { methods, obstetricHistoryId, addPara, updateParaData, fetchPara, control };
}
