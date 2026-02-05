"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { CurrentPregnancyFormData } from "../types";
import * as api from "../api";

export function useCurrentPregnancy(patientId: string | null) {
  const [visitId, setVisitId] = useState("");

  useEffect(() => {
    if (patientId) {
      fetchVisitId();
      fetchCurrentPregnancy();
    }
  }, [patientId]);

  async function fetchVisitId() {
    if (!patientId) return;
    try {
      const data = await api.getVisitId(patientId);
      if (data?.max) {
        setVisitId(data.max);
        toast.success("Successfully fetched visit_id");
      } else {
        toast.error(`Add patient in queue first (${data.error})`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch visit_id");
    }
  }

  async function fetchCurrentPregnancy() {
    if (!patientId) return;
    try {
      const data = await api.getCurrentPregnancy(patientId);
      return data;
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch current pregnancy data");
    }
  }

  async function addInfo(data: CurrentPregnancyFormData) {
    const formData = { ...data, patient_id: patientId!, visit_id: visitId };
    try {
      const res = await api.postCurrentPregnancy(formData);
      if (res.detail) toast.error(`Cannot add: ${res.detail}`);
      else toast.success("Current Pregnancy added successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add current pregnancy");
    }
  }

  async function updateInfo(data: CurrentPregnancyFormData) {
    const formData = { ...data, patient_id: patientId!, visit_id: visitId };
    try {
      await api.updateCurrentPregnancy(formData);
      toast.success("Current Pregnancy updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update current pregnancy");
    }
  }

  return { visitId, fetchCurrentPregnancy, addInfo, updateInfo };
}
