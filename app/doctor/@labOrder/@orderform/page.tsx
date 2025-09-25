"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import Select from "react-select";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { usePatient } from "@/contexts/PatientIdContext";

type OptionType = { value: string; label: string };

type LabTest = {
  test_id: string;
  test_name: string;
  category: string;
  price: number;
};

type FormValues = {
  tests: {
    category: OptionType | null;
    test: OptionType | null;
  }[];
};

export default function NewLabOrderForm() {
  const { patientId } = usePatient();
  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      tests: [{ category: null, test: null }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tests",
  });

  const watchTests = watch("tests");

  // fetch all tests (and derive categories)
  useEffect(() => {
    async function fetchTests() {
      const res = await fetch("/api/labTests/getallLabtests");
      if (!res.ok) return;
      const data: LabTest[] = await res.json();
      setTests(data);

      // derive distinct categories
      const uniqueCategories = Array.from(new Set(data.map((t) => t.category)));
      setCategoryOptions(uniqueCategories.map((c) => ({ value: c, label: c })));
    }
    fetchTests();
  }, []);

  const getTestOptions = (category: string | null) => {
    if (!category) return [];
    return tests
      .filter((t) => t.category === category)
      .map((t) => ({ value: t.test_id, label: t.test_name }));
  };

  const onSubmit = async (data: FormValues) => {
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

      const payload = {
        patient_id: patientId,
        tests: testDetails,
      };

      const res = await fetch("/api/labTests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create lab order");

      toast.success("Lab order created successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create lab order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Order Lab Tests</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-lg shadow-md border border-gray-200 overflow-y-auto h-[220px]">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-blue-50 text-gray-700 uppercase text-xs sticky top-0 z-50">
              <tr>
                <th className="px-3 py-2 border">Category</th>
                <th className="px-3 py-2 border">Test</th>
                <th className="px-3 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id}>
                  {/* Category */}
                  <td className="px-2 py-2 border">
                    <Controller
                      name={`tests.${index}.category`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={categoryOptions}
                          placeholder="Category"
                          onChange={(val) => {
                            setValue(`tests.${index}.category`, val);
                            setValue(`tests.${index}.test`, null);
                          }}
                        />
                      )}
                    />
                  </td>

                  {/* Test */}
                  <td className="px-2 py-2 border">
                    <Controller
                      name={`tests.${index}.test`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={getTestOptions(
                            watchTests[index]?.category?.value || null
                          )}
                          placeholder="Test"
                          isDisabled={!watchTests[index]?.category}
                        />
                      )}
                    />
                  </td>

                  {/* Remove */}
                  <td className="px-2 py-2 border text-center">
                    {fields.length > 1 && (
                      <button
                        type="button"
                        className="px-3 py-1 bg-red-500 text-white rounded"
                        onClick={() => remove(index)}
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={() => append({ category: null, test: null })}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={isSubmitting}
          >
            + Add Test
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "✅ Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
