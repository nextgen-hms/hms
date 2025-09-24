"use client";
import { useState, useEffect } from "react";
import { usePatient } from "@/contexts/PatientIdContext";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Select from "react-select";

// Types
type Prescription = {
  order_date: string;
  category: string;
  generic_name: string;
  brand_name: string;
  dosage_value: number;
  dosage_unit: string;
  instructions: string;
  prescribed_quantity: number;
  dispensed_quantity: number;
  frequency: number;
  duration: number;
  unit: string;
  prescribed_by: string;
  dispensed_by: string;
};

type Medicine = {
  category: string;
  generic: string;
  brandName: string;
  dosage_value: number;
  dosage_unit: string;
};

type OptionType = { value: string; label: string };

type FormValues = {
  prescriptions: {
    category: OptionType | null;
    generic: OptionType | null;
    brandName: OptionType | null;
    dosage_value: number;
    dosage_unit: OptionType | null;
    instructions: string;
    prescribed_quantity: number;
    dispensed_quantity: number;
    frequency: number;
    duration: number;
    unit: OptionType | null;
  }[];
};

export default function PharmacyOrder() {
  const { patientId, setPatientId } = usePatient();
  const [pId, setpId] = useState<string>("");
  const [previousData, setPreviousData] = useState<Prescription[]>([]);
  const [medicineCategory, setMedicineCategory] = useState<Medicine[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { control, handleSubmit, register } = useForm<FormValues>({
    defaultValues: {
      prescriptions: [
        {
          category: null,
          generic: null,
          brandName: null,
          dosage_value: 0,
          dosage_unit: null,
          instructions: "",
          prescribed_quantity: 1,
          dispensed_quantity: 0,
          frequency: 1,
          duration: 1,
          unit: null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "prescriptions",
  });

  // Fetch categories
  async function getMedicineCategories() {
    try {
      const res = await fetch("api/medicine/category");
      const data = await res.json();
      const options = data.map((d: any) => ({
        value: d.category,
        label: d.category,
      }));
      setCategoryOptions(options);
    } catch (err) {
      console.log(err);
    }
  }

  // Fetch previous prescriptions
  async function getPreviousPrescriptions() {
    try {
      const res = await fetch(`/api/prescription/${patientId}`);
      const resdata = await res.json();
      resdata.forEach((d: any) => {
        d.order_date = d.order_date?.split("T")[0];
      });
      setPreviousData(resdata);
    } catch (err) {
      console.log(err);
    }
  }

  // Fetch medicines by category
  async function getMedicineByCategory(category: string) {
    try {
      const res = await fetch(`/api/medicine/category/${category}`);
      const data = await res.json();
      setMedicineCategory(data);
    } catch (err) {
      console.log(err);
    }
  }

  // On patient change
  useEffect(() => {
    if (patientId) {
      setpId(patientId);
      getPreviousPrescriptions();
    }
  }, [patientId]);

  // On mount, fetch categories
  useEffect(() => {
    getMedicineCategories();
  }, []);

  // On category change
  useEffect(() => {
    if (selectedCategory) getMedicineByCategory(selectedCategory);
  }, [selectedCategory]);

  // Submit
  const onSubmit = async (data: FormValues) => {
    if (!patientId) return;
    const res = await fetch(`api/prescription/${patientId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    console.log(await res.json());
  };

  return (
    <div>
      {/* Patient ID Input */}
      <div className="flex flex-col">
        <label htmlFor="pid" className="px-2 pb-1 text-sm text-black/70">
          Patient Id:
        </label>
        <input
          id="pid"
          type="text"
          placeholder="Enter Patient Id"
          className="w-[40%] p-2 bg-gray-200 rounded-2xl"
          value={pId}
          onChange={(e) => setpId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPatientId(pId);
            }
          }}
        />
      </div>

      {/* Previous Prescriptions */}
      <div>
        <h1 className="py-2 mb-2 text-3xl font-semibold border-b-2 w-fit">
          Previous prescriptions
        </h1>
        <table className="border border-gray-300 w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Order Date</th>
              <th className="border px-2 py-1">Category</th>
              <th className="border px-2 py-1">Generic</th>
              <th className="border px-2 py-1">Brand</th>
              <th className="border px-2 py-1">Dosage Value</th>
              <th className="border px-2 py-1">Dosage Unit</th>
              <th className="border px-2 py-1">Instructions</th>
              <th className="border px-2 py-1">Frequency</th>
              <th className="border px-2 py-1">Duration</th>
              <th className="border px-2 py-1">Prescribed Qty</th>
              <th className="border px-2 py-1">Dispensed Qty</th>
              <th className="border px-2 py-1">Prescribed By</th>
              <th className="border px-2 py-1">Dispensed By</th>
            </tr>
          </thead>
          <tbody>
            {previousData.length > 0 ? (
              previousData.map((d, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{d.order_date}</td>
                  <td className="border px-2 py-1">{d.category}</td>
                  <td className="border px-2 py-1">{d.generic_name}</td>
                  <td className="border px-2 py-1">{d.brand_name}</td>
                  <td className="border px-2 py-1">{d.dosage_value}</td>
                  <td className="border px-2 py-1">{d.dosage_unit}</td>
                  <td className="border px-2 py-1">{d.instructions}</td>
                  <td className="border px-2 py-1">{d.frequency}</td>
                  <td className="border px-2 py-1">{d.duration}</td>
                  <td className="border px-2 py-1">{d.prescribed_quantity}</td>
                  <td className="border px-2 py-1">{d.dispensed_quantity}</td>
                  <td className="border px-2 py-1">{d.prescribed_by}</td>
                  <td className="border px-2 py-1">{d.dispensed_by}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={13} className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Prescribe Medicines */}
      <div className="mt-6">
        <h1 className="py-2 mb-2 text-3xl font-semibold border-b-2 w-fit">
          Prescribe Medicines
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <table className="border border-gray-300 w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Category</th>
                <th className="border px-2 py-1">Generic</th>
                <th className="border px-2 py-1">Brand</th>
                <th className="border px-2 py-1">Dosage Value</th>
                <th className="border px-2 py-1">Dosage Unit</th>
                <th className="border px-2 py-1">Instructions</th>
                <th className="border px-2 py-1">Prescribed Qty</th>
                <th className="border px-2 py-1">Dispensed Qty</th>
                <th className="border px-2 py-1">Frequency</th>
                <th className="border px-2 py-1">Duration</th>
                <th className="border px-2 py-1">Unit</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id}>
                  {/* Category */}
                  <td>
                    <Controller
                      name={`prescriptions.${index}.category`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={categoryOptions}
                          placeholder="Category"
                          onChange={(val) => {
                            field.onChange(val);
                            setSelectedCategory(val?.value || "");
                          }}
                        />
                      )}
                    />
                  </td>

                  {/* Generic */}
                  <td>
                    <Controller
                      name={`prescriptions.${index}.generic`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={medicineCategory.map((m) => ({
                            value: m.generic,
                            label: m.generic,
                          }))}
                          placeholder="Generic"
                        />
                      )}
                    />
                  </td>

                  {/* Brand */}
                  <td>
                    <Controller
                      name={`prescriptions.${index}.brandName`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={medicineCategory.map((m) => ({
                            value: m.brandName,
                            label: m.brandName,
                          }))}
                          placeholder="Brand"
                        />
                      )}
                    />
                  </td>

                  {/* Dosage Value */}
                  <td>
                    <input
                      type="number"
                      className="w-full text-center border border-black/20 py-1.5"
                      {...register(
                        `prescriptions.${index}.dosage_value` as const
                      )}
                    />
                  </td>

                  {/* Dosage Unit */}
                  <td>
                    <Controller
                      name={`prescriptions.${index}.dosage_unit`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[
                            { value: "mg", label: "mg" },
                            { value: "ml", label: "ml" },
                            { value: "tablet", label: "Tablet" },
                          ]}
                          placeholder="Unit"
                        />
                      )}
                    />
                  </td>

                  {/* Instructions */}
                  <td>
                    <input
                      type="text"
                      className="w-full border border-black/20 py-1.5 px-2"
                      {...register(
                        `prescriptions.${index}.instructions` as const
                      )}
                    />
                  </td>

                  {/* Prescribed Qty */}
                  <td>
                    <input
                      type="number"
                      className="w-full text-center border border-black/20 py-1.5"
                      {...register(
                        `prescriptions.${index}.prescribed_quantity` as const
                      )}
                    />
                  </td>

                  {/* Dispensed Qty */}
                  <td>
                    <input
                      type="number"
                      className="w-full text-center border border-black/20 py-1.5"
                      {...register(
                        `prescriptions.${index}.dispensed_quantity` as const
                      )}
                    />
                  </td>

                  {/* Frequency */}
                  <td>
                    <input
                      type="number"
                      className="w-full text-center border border-black/20 py-1.5"
                      {...register(`prescriptions.${index}.frequency` as const)}
                    />
                  </td>

                  {/* Duration */}
                  <td>
                    <input
                      type="number"
                      className="w-full text-center border border-black/20 py-1.5"
                      {...register(`prescriptions.${index}.duration` as const)}
                    />
                  </td>

                  {/* Unit */}
                  <td>
                    <Controller
                      name={`prescriptions.${index}.unit`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[
                            { value: "days", label: "Days" },
                            { value: "weeks", label: "Weeks" },
                          ]}
                          placeholder="Unit"
                        />
                      )}
                    />
                  </td>

                  {/* Remove Row */}
                  <td className="grid place-items-center p-1.5 border border-black/20">
                    <button
                      type="button"
                      className="px-2 bg-red-500 text-white rounded"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add Row + Submit */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() =>
                append({
                  category: null,
                  generic: null,
                  brandName: null,
                  dosage_value: 0,
                  dosage_unit: null,
                  instructions: "",
                  prescribed_quantity: 1,
                  dispensed_quantity: 0,
                  frequency: 1,
                  duration: 1,
                  unit: null,
                })
              }
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Medicine
            </button>
            <button
              type="submit"
              className="ml-4 px-4 py-2 bg-green-600 text-white rounded"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
