"use client";
import { useState, useEffect } from "react";
import { usePatient } from "@/contexts/PatientIdContext";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Select from "react-select";

type LabOrder = {
  patientId: string;
  orderDate: string;
  category: string;
  testName: string;
  priority: string;
  status: string;
  notes?: string;
  orderedBy: string;
};

type LabTest = {
  category: string;
  testName: string;
};

type OptionType = { value: string; label: string };

const categoryOptions: OptionType[] = [
  { value: "blood", label: "Blood" },
  { value: "urine", label: "Urine" },
  { value: "xray", label: "X-Ray" },
  { value: "ct", label: "CT Scan" },
];

const priorityOptions: OptionType[] = [
  { value: "routine", label: "Routine" },
  { value: "urgent", label: "Urgent" },
  { value: "stat", label: "STAT" },
];

const statusOptions: OptionType[] = [
  { value: "ordered", label: "Ordered" },
  { value: "sample_taken", label: "Sample Taken" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "result_sent", label: "Result Sent" },
];

type FormValues = {
  labOrders: {
    category: OptionType | null;
    testName: OptionType | null;
    priority: OptionType | null;
    status: OptionType | null;
    notes?: string;
  }[];
};

export default function LabOrders() {
  const { patientId, setPatientId } = usePatient();
  const [pId, setPId] = useState("");
  const [previousOrders, setPreviousOrders] = useState<LabOrder[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const { control, handleSubmit, register } = useForm<FormValues>({
    defaultValues: {
      labOrders: [
        {
          category: null,
          testName: null,
          priority: null,
          status: null,
          notes: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "labOrders",
  });

  async function getPreviousLabOrders() {
    const res = await fetch(`/api/labTests/${patientId}`);
    const data = await res.json();
    setPreviousOrders(data);
  }

  async function getLabTestsByCategory(category: string) {
    const res = await fetch(`/api/labTests/category/${category}`);
    const data = await res.json();
    console.log(data);
    
    setLabTests(data);
  }

  useEffect(() => {
    if (patientId) {
      setPId(patientId);
      getPreviousLabOrders();
    }
  }, [patientId]);

  useEffect(() => {
    if (selectedCategory) getLabTestsByCategory(selectedCategory);
  }, [selectedCategory]);

  const onSubmit = async (data: FormValues) => {
    if (!patientId) return;
    const res = await fetch(`/api/labTests/${patientId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    console.log(await res.json());
  };

  return (
    <div>
      {/* Patient ID Input */}
      <div className="flex flex-col mb-4">
        <label htmlFor="pid" className="px-2 pb-1 text-sm text-black/70">
          Patient Id:
        </label>
        <input
          id="pid"
          type="text"
          placeholder="Enter Patient ID"
          className="w-[40%] p-2 bg-gray-200 rounded-2xl"
          value={pId}
          onChange={(e) => setPId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPatientId(pId);
            }
          }}
        />
      </div>

      {/* Previous Lab Orders */}
      <div>
        <h1 className="py-2 mb-2 text-3xl font-semibold border-b-2 w-fit">
          Previous Lab Orders
        </h1>
        <table className="border border-gray-300 w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Order Date</th>
              <th className="border px-2 py-1">Category</th>
              <th className="border px-2 py-1">Test Name</th>
              <th className="border px-2 py-1">Priority</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Notes</th>
              <th className="border px-2 py-1">Ordered By</th>
            </tr>
          </thead>
          <tbody>
            {previousOrders.length > 0 ? (
              previousOrders.map((o, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{o.orderDate}</td>
                  <td className="border px-2 py-1">{o.category}</td>
                  <td className="border px-2 py-1">{o.testName}</td>
                  <td className="border px-2 py-1">{o.priority}</td>
                  <td className="border px-2 py-1">{o.status}</td>
                  <td className="border px-2 py-1">{o.notes}</td>
                  <td className="border px-2 py-1">{o.orderedBy}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">
                  No lab orders available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Lab Orders Form */}
      <div className="mt-6">
        <h1 className="py-2 mb-2 text-3xl font-semibold border-b-2 w-fit">
          Create Lab Orders
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <table className="border border-gray-300 w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Category</th>
                <th className="border px-2 py-1">Test Name</th>
                <th className="border px-2 py-1">Priority</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Notes</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id}>
                  {/* Category */}
                  <td>
                    <Controller
                      name={`labOrders.${index}.category`}
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

                  {/* Test Name */}
                  <td>
                    <Controller
                      name={`labOrders.${index}.testName`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={labTests.map((t) => ({
                            value: t.testName,
                            label: t.testName,
                          }))}
                          placeholder="Test Name"
                        />
                      )}
                    />
                  </td>

                  {/* Priority */}
                  <td>
                    <Controller
                      name={`labOrders.${index}.priority`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={priorityOptions}
                          placeholder="Priority"
                        />
                      )}
                    />
                  </td>

                  {/* Status */}
                  <td>
                    <Controller
                      name={`labOrders.${index}.status`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={statusOptions}
                          placeholder="Status"
                        />
                      )}
                    />
                  </td>

                  {/* Notes */}
                  <td>
                    <input
                      type="text"
                      placeholder="Add notes or result link"
                      className="w-full border border-black/20 py-1.5 px-2"
                      {...register(`labOrders.${index}.notes` as const)}
                    />
                  </td>

                  {/* Remove */}
                  <td className="text-center">
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

          <div className="mt-4">
            <button
              type="button"
              onClick={() =>
                append({
                  category: null,
                  testName: null,
                  priority: null,
                  status: null,
                  notes: "",
                })
              }
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Lab Test
            </button>
            <button
              type="submit"
              className="ml-4 px-4 py-2 bg-green-600 text-white rounded"
            >
              Submit Orders
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
