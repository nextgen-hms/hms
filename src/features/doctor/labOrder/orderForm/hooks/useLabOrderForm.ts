"use client"

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { usePatient } from "@/contexts/PatientIdContext";
import { LabTest, LabOrderFormValues, OptionType } from "../types";
import * as api from "../api";

export function useLabOrderForm() {
  const { patientId } = usePatient();
  const [tests, setTests] = useState<LabTest[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, setValue, watch } = useForm<LabOrderFormValues>({
    defaultValues: { tests: [{ category: null, test: null }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "tests" });

  const watchTests = watch("tests");

  useEffect(() => {
    async function fetchTests() {
      try {
        const data = await api.fetchAllLabTests();
        setTests(data);

        const uniqueCategories = Array.from(new Set(data.map((t) => t.category)));
        setCategoryOptions(uniqueCategories.map((c) => ({ value: c, label: c })));
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to fetch lab tests");
      }
    }
    fetchTests();
  }, []);

  const getTestOptions = (category: string | null) => {
    if (!category) return [];
    return tests.filter((t) => t.category === category).map((t) => ({ value: t.test_id, label: t.test_name }));
  };

  const onSubmit = async (data: LabOrderFormValues) => {
    if (!patientId) {
      toast.error("No patient selected");
      return;
    }

    try {
      setIsSubmitting(true);

      const testDetails = data.tests.map((item) => ({
        doctor_id: 1, // TODO: Replace with actual doctor ID from auth
        test_id: item.test?.value,
      }));

      await api.createLabOrder(patientId, testDetails);

      toast.success("Lab order created successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create lab order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    control,
    handleSubmit,
    setValue,
    watchTests,
    fields,
    append,
    remove,
    getTestOptions,
    categoryOptions,
    onSubmit,
    isSubmitting,
  };
}
