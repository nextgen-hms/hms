"use client";
import { useState, useEffect } from "react";
import { usePatient } from "@/contexts/PatientIdContext";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Select from "react-select";

type Prescription = {
  patientId: string;
  orderDate: string;
  category: string;
  generic: string;
  brandName: string;
  dose: string;
  frequency: string;
  duration: string;
  unit: string;
  prescribedBy: string;
  quantity: string;
};

type Medicine = {
  category: string;
  generic: string;
  brandName: string;
  dose: string;
};

type OptionType = {
  value: string;
  label: string;
};

const categoryOptions: OptionType[] = [
  { value: "iron", label: "Iron" },
  { value: "antibiotic", label: "Antibiotic" },
  { value: "sugar", label: "Sugar" },
  { value: "drugs", label: "Drugs" },
];

type FormValues = {
  prescriptions: {
    category: OptionType | null;
    generic: OptionType | null;
    brandName: OptionType | null;
    dose: OptionType | null;
    quantity: number;
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      prescriptions: [
        {
          category: null,
          generic: null,
          brandName: null,
          dose: null,
          quantity: 1,
          frequency: 1,
          duration: 1,
          unit: null,
        },
         {
          category: null,
          generic: null,
          brandName: null,
          dose: null,
          quantity: 1,
          frequency: 1,
          duration: 1,
          unit: null,
        },
         {
          category: null,
          generic: null,
          brandName: null,
          dose: null,
          quantity: 1,
          frequency: 1,
          duration: 1,
          unit: null,
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "prescriptions",
  });

  // Fetch previous prescriptions
  async function getPreviousPrescriptions() {
    const res = await fetch(`/api/perscription/${patientId}`);
    const resdata = await res.json();
    setPreviousData(resdata.prescriptions);
  }

  // Fetch medicine by category
  async function getMedicineByCategory(category: string) {
    const res = await fetch(`/api/medicine/category/${category}`);
    const data = await res.json();
    setMedicineCategory(data);
  }

  // On patient change
  useEffect(() => {
    if (patientId) {
      setpId(patientId);
      getPreviousPrescriptions();
    }
  }, [patientId]);

  // On category change
  useEffect(() => {
    if (selectedCategory) getMedicineByCategory(selectedCategory);
  }, [selectedCategory]);

  const onSubmit = async (data: FormValues) => {
    if(!patientId) return;
    const res=await fetch(`api/medicine/${patientId}`,{
           method:"POST",
           body:JSON.stringify(data)
    })
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
          placeholder="Enter existing Patient Id"
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
              <th className="border px-2 py-1">Brand Name</th>
              <th className="border px-2 py-1">Dose</th>
              <th className="border px-2 py-1">Quantity</th>
              <th className="border px-2 py-1">Frequency</th>
              <th className="border px-2 py-1">Duration</th>
              <th className="border px-2 py-1">Unit</th>
              <th className="border px-2 py-1">Prescribed By</th>
            </tr>
          </thead>
          <tbody>
            {previousData.length > 0 ? (
              previousData.map((d, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{d.orderDate}</td>
                  <td className="border px-2 py-1">{d.category}</td>
                  <td className="border px-2 py-1">{d.generic}</td>
                  <td className="border px-2 py-1">{d.brandName}</td>
                  <td className="border px-2 py-1">{d.dose}</td>
                  <td className="border px-2 py-1">{d.quantity}</td>
                  <td className="border px-2 py-1">{d.frequency}</td>
                  <td className="border px-2 py-1">{d.duration}</td>
                  <td className="border px-2 py-1">{d.unit}</td>
                  <td className="border px-2 py-1">{d.prescribedBy}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center">
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
                <th className="border px-2 py-1">Brand Name</th>
                <th className="border px-2 py-1">Dose</th>
                <th className="border px-2 py-1">Quantity</th>
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

                  {/* Dose */}
                 <td>
  <Controller
    name={`prescriptions.${index}.dose`}
    control={control}
    render={({ field }) => {
      // Get unique dose values
      const uniqueDoses = Array.from(
        new Set(medicineCategory.map((m) => m.dose))
      ).map((dose) => ({
        value: dose,
        label: dose,
      }));

      return (
        <Select
          {...field}
          options={uniqueDoses}
          placeholder="Dose"
        />
      );
    }}
  />
</td>

                  {/* Quantity */}
                  <td>
                    <input
                      type="number"
                      className="w-full text-center border-1  border-black/20 py-1.5"
                      {...control.register(
                        `prescriptions.${index}.quantity` as const
                      )}
                    />
                  </td>

                  {/* Frequency */}
                  <td>
                    <input
                      type="number"
                      className="w-full text-center border-1  border-black/20 py-1.5"
                      {...control.register(
                        `prescriptions.${index}.frequency` as const
                      )}
                    />
                  </td>

                  {/* Duration */}
                  <td>
                    <input
                      type="number"
                      className="w-full text-center border-1  border-black/20 py-1.5"
                      {...control.register(
                        `prescriptions.${index}.duration` as const
                      )}
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
                  <td className="grid place-items-center p-1.5 border-1  border-black/20">
                    <button
                      type="button"
                      className="px-2  bg-red-500 text-white rounded"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add Row Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() =>
                append({
                  category: null,
                  generic: null,
                  brandName: null,
                  dose: null,
                  quantity: 1,
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
