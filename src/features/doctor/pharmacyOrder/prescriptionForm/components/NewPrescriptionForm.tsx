"use client";

import Select from "react-select";
import { Controller } from "react-hook-form";
import { usePrescriptionForm } from "../hooks/usePrescriptionForm";

export default function NewPrescriptionForm() {
  const { formMethods, fields, append, remove, prescriptions, categoryOptions, medicineOptions, isSubmitting, setValue, onSubmit } = usePrescriptionForm();

  const selectStyles = {
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
    control: (base: any) => ({ ...base, fontSize: "16px", minHeight: "28px" }),
    menu: (base: any) => ({ ...base, fontSize: "16px" }),
    option: (base: any) => ({ ...base, fontSize: "16px", padding: "4px 8px" }),
    singleValue: (base: any) => ({ ...base, fontSize: "16px" }),
  };

  // Similar logic for filtered options and dependent dropdowns can go here
  const getFilteredOptions = (index: number) => {
    const current = prescriptions[index];
    const category = current?.category?.value;
    if (!category) return { genericOptions: [], brandOptions: [], dosageOptions: [] };

    const meds = medicineOptions.filter(m => m.category === category);
    const genericOptions = [...new Map(meds.map(m => [m.generic_name, m])).values()].map(m => ({ value: m.generic_name, label: m.generic_name }));
    const generic = current?.generic?.value;
    const brandOptions = generic ? meds.filter(m => m.generic_name === generic).map(m => ({ value: m.brand_name, label: m.brand_name })) : [];
    const brand = current?.brandName?.value;
    const dosageOptions = brand ? meds.filter(m => m.brand_name === brand).map(m => ({ value: `${m.dosage_value} ${m.dosage_unit}`, label: `${m.dosage_value} ${m.dosage_unit}` })) : [];
    return { genericOptions, brandOptions, dosageOptions };
  };

  const handleCategoryChange = (index: number, value: any) => {
    setValue(`prescriptions.${index}.category`, value);
    setValue(`prescriptions.${index}.generic`, null);
    setValue(`prescriptions.${index}.brandName`, null);
    setValue(`prescriptions.${index}.dosage`, null);
  };

  const handleGenericChange = (index: number, value: any) => {
    setValue(`prescriptions.${index}.generic`, value);
    setValue(`prescriptions.${index}.brandName`, null);
    setValue(`prescriptions.${index}.dosage`, null);
  };

  const handleBrandChange = (index: number, value: any) => {
    setValue(`prescriptions.${index}.brandName`, value);
    setValue(`prescriptions.${index}.dosage`, null);
  };

  return (
    <form onSubmit={formMethods.handleSubmit(onSubmit)}>
      <table className="w-full text-sm border-collapse">
        <thead>...</thead>
        <tbody>
          {fields.map((field, index) => {
            const { genericOptions, brandOptions, dosageOptions } = getFilteredOptions(index);
            return (
              <tr key={field.id}>
                <td>
                  <Controller
                    name={`prescriptions.${index}.category`}
                    control={formMethods.control}
                    render={({ field }) => <Select {...field} options={categoryOptions} onChange={(val) => handleCategoryChange(index, val)} styles={selectStyles} menuPortalTarget={document.body} />}
                  />
                </td>
                {/* Similarly render Generic, Brand, Dosage, Duration, Frequency, Instructions, Qty */}
                <td>
                  {fields.length > 1 && <button type="button" onClick={() => remove(index)}>✕</button>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 flex gap-4">
        <button type="button" onClick={() => append({ category: null, generic: null, brandName: null, dosage: null, instructions: "", prescribed_quantity: 1, dispensed_quantity: 0, frequency: "", duration: "", unit: null })}>+ Add Medicine</button>
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</button>
      </div>
    </form>
  );
}
