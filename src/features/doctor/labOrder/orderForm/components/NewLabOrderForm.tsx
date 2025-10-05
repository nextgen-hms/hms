

// features/labOrder/components/NewLabOrderForm.tsx

"use client";
import { Controller } from "react-hook-form";
import Select from "react-select";
import { useLabOrderForm } from "../hooks/useLabOrderForm";

export default function NewLabOrderForm() {
  const {
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
  } = useLabOrderForm();

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
                          options={getTestOptions(watchTests[index]?.category?.value || null)}
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
