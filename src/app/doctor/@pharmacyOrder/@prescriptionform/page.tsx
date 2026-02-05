"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import Select from "react-select";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { usePatient } from "@/contexts/PatientIdContext";

type OptionType = { value: string; label: string };

type FormValues = {
  prescriptions: {
    category: OptionType | null;
    generic: OptionType | null;
    brandName: OptionType | null;
    dosage: OptionType | null;
    instructions: string;
    prescribed_quantity: number;
    dispensed_quantity: number;
    frequency: string;
    duration: string;
    unit: OptionType | null;
  }[];
};

type Medicine = {
  medicine_id: string;
  category: string;
  generic_name: string;
  brand_name: string;
  dosage_value: number;
  dosage_unit: string;
};

export default function NewPrescriptionForm() {
  const selectStyles = {
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
    control: (base: any) => ({
      ...base,
      fontSize: "16px",
      minHeight: "28px",
    }),
    menu: (base: any) => ({
      ...base,
      fontSize: "16px",
    }),
    option: (base: any) => ({
      ...base,
      fontSize: "16px",
      padding: "4px 8px",
    }),
    singleValue: (base: any) => ({
      ...base,
      fontSize: "16px",
    }),
  };

  const { patientId } = usePatient();
  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);
  const [medicineOptions, setMedicineOptions] = useState<Medicine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, register, watch, setValue } = useForm<FormValues>({
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "prescriptions",
  });

  // Watch all prescription values to handle dependent dropdowns
  const prescriptions = watch("prescriptions");

  // Get all categories on mount
  useEffect(() => {
    async function getCategories() {
      try {
        const res = await fetch("/api/medicine/category");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        const opts = data.map((d: any) => ({
          value: d.category,
          label: d.category,
        }));
        setCategoryOptions(opts);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load medicine categories");
      }
    }
    getCategories();
  }, []);

  // Get medicines when category changes for each row
  useEffect(() => {
    const fetchMedicinesForRows = async () => {
      const categories = prescriptions.map(p => p.category?.value).filter(Boolean);
      const uniqueCategories = [...new Set(categories)];

      for (const category of uniqueCategories) {
        if (category) {
          try {
            const res = await fetch(`/api/medicine/category/${category}`);
            if (!res.ok) throw new Error(`Failed to fetch medicines for ${category}`);
            const data = await res.json();
            
            // Merge with existing medicines, avoiding duplicates
            setMedicineOptions(prev => {
              const newMedicines = data.filter((newMed: Medicine) => 
                !prev.some(existing => existing.medicine_id === newMed.medicine_id)
              );
              return [...prev, ...newMedicines];
            });
          } catch (error) {
            console.error(`Error fetching medicines for category ${category}:`, error);
          }
        }
      }
    };

    fetchMedicinesForRows();
  }, [prescriptions.map(p => p.category?.value).join(',')]);

  // Get filtered options for each row
  const getFilteredOptions = (index: number) => {
    const currentPrescription = prescriptions[index];
    const category = currentPrescription?.category?.value;
    
    if (!category) {
      return { genericOptions: [], brandOptions: [], dosageOptions: [] };
    }

    // Filter medicines by category
    const categoryMedicines = medicineOptions.filter(m => m.category === category);
    
    // Get unique generic names
    const genericOptions = Array.from(
      new Map(categoryMedicines.map(m => [m.generic_name, m])).values()
    ).map(m => ({ value: m.generic_name, label: m.generic_name }));

    // Get brand names based on selected generic
    const generic = currentPrescription?.generic?.value;
    const brandMedicines = generic 
      ? categoryMedicines.filter(m => m.generic_name === generic)
      : [];

    const brandOptions = Array.from(
      new Map(brandMedicines.map(m => [m.brand_name, m])).values()
    ).map(m => ({ value: m.brand_name, label: m.brand_name }));

    // Get dosages based on selected brand
    const brand = currentPrescription?.brandName?.value;
    const dosageMedicines = brand 
      ? brandMedicines.filter(m => m.brand_name === brand)
      : [];

    const dosageOptions = dosageMedicines.map(m => ({
      value: `${m.dosage_value} ${m.dosage_unit}`,
      label: `${m.dosage_value} ${m.dosage_unit}`,
    }));

    return { genericOptions, brandOptions, dosageOptions };
  };

  // Handle category change - reset dependent fields
  const handleCategoryChange = (index: number, value: OptionType | null) => {
    setValue(`prescriptions.${index}.category`, value);
    setValue(`prescriptions.${index}.generic`, null);
    setValue(`prescriptions.${index}.brandName`, null);
    setValue(`prescriptions.${index}.dosage`, null);
  };

  // Handle generic change - reset dependent fields
  const handleGenericChange = (index: number, value: OptionType | null) => {
    setValue(`prescriptions.${index}.generic`, value);
    setValue(`prescriptions.${index}.brandName`, null);
    setValue(`prescriptions.${index}.dosage`, null);
  };

  // Handle brand change - reset dependent fields
  const handleBrandChange = (index: number, value: OptionType | null) => {
    setValue(`prescriptions.${index}.brandName`, value);
    setValue(`prescriptions.${index}.dosage`, null);
  };

  const onSubmit = async (data: FormValues) => {
    if (!patientId) {
      toast.error("No patient selected");
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate all prescriptions have required fields
      const invalidPrescriptions = data.prescriptions.filter(p => 
        !p.category?.value || !p.generic?.value || !p.brandName?.value || !p.dosage?.value
      );

      if (invalidPrescriptions.length > 0) {
        toast.error("Please fill all medicine fields (Category, Generic, Brand, Dosage)");
        return;
      }

      // Map prescriptions to payload
      const prescriptionDetails = data.prescriptions.map((item, index) => {
        // Find the exact medicine
        const medicine = medicineOptions.find(m => 
          m.category === item.category?.value &&
          m.generic_name === item.generic?.value &&
          m.brand_name === item.brandName?.value &&
          `${m.dosage_value} ${m.dosage_unit}` === item.dosage?.value
        );

        if (!medicine) {
          throw new Error(
            `Medicine not found for: ${item.generic?.value} / ${item.brandName?.value} / ${item.dosage?.value}`
          );
        }

        return {
          doctor_id: 1, // TODO: Replace with actual doctor ID from auth
          medicine_id: medicine.medicine_id,
          dosage: item.dosage?.value || "",
          instructions: item.instructions,
          prescribed_quantity: item.prescribed_quantity,
          dispensed_quantity: item.dispensed_quantity,
          frequency: item.frequency,
          duration: item.duration,
        };
      });

      const payload = {
        patient_id: patientId,
        prescriptions: prescriptionDetails,
      };

      console.log("Submitting payload:", payload);

      const res = await fetch(`/api/prescription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create prescription");
      }

      const result = await res.json();
      toast.success("Prescription created successfully!");
      console.log("Prescription created:", result);

      // Reset form or navigate away
      // You might want to reset the form here or redirect

    } catch (error: any) {
      console.error("Error submitting prescription:", error);
      toast.error(error.message || "Failed to create prescription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="">
      <h2 className="text-2xl font-semibold mb-6">Prescribe Medicines</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-lg shadow-md border border-gray-200 overflow-y-auto h-[220px]">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-blue-50 text-gray-700 uppercase text-xs sticky top-0 z-50">
              <tr>
                <th className="px-3 py-2 border">Category</th>
                <th className="px-3 py-2 border">Generic</th>
                <th className="px-3 py-2 border">Brand</th>
                <th className="px-3 py-2 border">Dosage</th>
                <th className="px-3 py-2 border">Duration</th>
                <th className="px-3 py-2 border">Frequency</th>
                <th className="px-3 py-2 border">Instructions</th>
                <th className="px-3 py-2 border">Qty</th>
                <th className="px-3 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const { genericOptions, brandOptions, dosageOptions } = getFilteredOptions(index);
                
                return (
                  <tr key={field.id} className="hover:bg-gray-50">
                    {/* Category */}
                    <td className="px-2 py-2 border">
                      <Controller
                        name={`prescriptions.${index}.category`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={categoryOptions}
                            placeholder="Category"
                            onChange={(val) => handleCategoryChange(index, val)}
                            menuPortalTarget={document.body}
                            styles={selectStyles}
                            className="text-sm"
                          />
                        )}
                      />
                    </td>

                    {/* Generic */}
                    <td className="px-2 py-2 border">
                      <Controller
                        name={`prescriptions.${index}.generic`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={genericOptions}
                            placeholder="Generic"
                            isDisabled={!prescriptions[index]?.category}
                            onChange={(val) => handleGenericChange(index, val)}
                            menuPortalTarget={document.body}
                            styles={selectStyles}
                            className="text-sm"
                          />
                        )}
                      />
                    </td>

                    {/* Brand */}
                    <td className="px-2 py-2 border">
                      <Controller
                        name={`prescriptions.${index}.brandName`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={brandOptions}
                            placeholder="Brand"
                            isDisabled={!prescriptions[index]?.generic}
                            onChange={(val) => handleBrandChange(index, val)}
                            menuPortalTarget={document.body}
                            styles={selectStyles}
                            className="text-sm"
                          />
                        )}
                      />
                    </td>

                    {/* Dosage */}
                    <td className="px-2 py-2 border">
                      <Controller
                        name={`prescriptions.${index}.dosage`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={dosageOptions}
                            placeholder="Dosage"
                            isDisabled={!prescriptions[index]?.brandName}
                            menuPortalTarget={document.body}
                            styles={selectStyles}
                          />
                        )}
                      />
                    </td>

                    {/* Duration */}
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        className="w-full border rounded-md px-2 py-1 text-sm"
                        placeholder="e.g., 7 days"
                        {...register(`prescriptions.${index}.duration`)}
                      />
                    </td>

                    {/* Frequency */}
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        className="w-full border rounded-md px-2 py-1 text-sm"
                        placeholder="e.g., 3 times daily"
                        {...register(`prescriptions.${index}.frequency`)}
                      />
                    </td>

                    {/* Instructions */}
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        className="w-full border rounded-md px-2 py-1 text-sm"
                        placeholder="Instructions"
                        {...register(`prescriptions.${index}.instructions`)}
                      />
                    </td>

                    {/* Quantity */}
                    <td className="px-2 py-2 border w-20">
                      <input
                        type="number"
                        min="1"
                        className="w-full text-center border rounded-md px-1 py-1 text-sm"
                        {...register(`prescriptions.${index}.prescribed_quantity`, {
                          valueAsNumber: true,
                          min: 1
                        })}
                      />
                    </td>

                    {/* Action */}
                    <td className="px-2 py-2 border text-center">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                          onClick={() => remove(index)}
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={() =>
              append({
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
              })
            }
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            + Add Medicine
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "✅ Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}