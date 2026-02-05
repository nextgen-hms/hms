// hooks/usePrescriptionForm.ts
import { useEffect, useState } from "react";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { usePatient } from "@/contexts/PatientIdContext";
import toast from "react-hot-toast";
import { FormValues, OptionType, Medicine } from "../types";
import * as api from "../api";

export function usePrescriptionForm() {
  const { patientId } = usePatient();
  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);
  const [medicineOptions, setMedicineOptions] = useState<Medicine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ⚡ useForm with FormValues typing
  const formMethods: UseFormReturn<FormValues> = useForm<FormValues>({
    defaultValues: {
      prescriptions: [
        {
          category: null,
          generic: null,
          brandName: null,
          dosage: null,
          instructions: "",
          prescribed_quantity: 1,
          dispensed_quantity: 0,
          frequency: "",
          duration: "",
          unit: null,
        },
      ],
    },
  });

  // ⚡ Destructure what you need
  const { control, watch, setValue, handleSubmit } = formMethods;

  // ⚡ useFieldArray only for manipulating array
  const { fields, append, remove } = useFieldArray({
    control,
    name: "prescriptions",
  });

  const prescriptions = watch("prescriptions"); // ✅ correct

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await api.fetchCategories();
        const opts: OptionType[] = data.map(d => ({ value: d.category, label: d.category }));
        setCategoryOptions(opts);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load medicine categories");
      }
    }
    loadCategories();
  }, []);

  // Load medicines when category changes
  useEffect(() => {
    const fetchMedicines = async () => {
      const categories = prescriptions.map(p => p.category?.value).filter(Boolean);
      const uniqueCategories = [...new Set(categories)];

      for (const category of uniqueCategories) {
        try {
          const data = await api.fetchMedicinesByCategory(category as string);
          setMedicineOptions(prev =>
            [...prev, ...data.filter(m => !prev.some(p => p.medicine_id === m.medicine_id))]
          );
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchMedicines();
  }, [prescriptions.map(p => p.category?.value).join(",")]);

  const onSubmit = async (data: FormValues) => {
    if (!patientId) return toast.error("No patient selected");

    setIsSubmitting(true);

    try {
      const invalid = data.prescriptions.filter(
        p => !p.category?.value || !p.generic?.value || !p.brandName?.value || !p.dosage?.value
      );
      if (invalid.length > 0) throw new Error("Please fill all medicine fields");

      await api.createPrescription(patientId, data.prescriptions);
      toast.success("Prescription created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit prescription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formMethods,
    fields,
    append,
    remove,
    prescriptions,
    categoryOptions,
    medicineOptions,
    isSubmitting,
    setValue,
    handleSubmit,
    onSubmit,
  };
}
