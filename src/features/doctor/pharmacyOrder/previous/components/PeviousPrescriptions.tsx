// features/prescription/components/PreviousPrescriptions.tsx
"use client";

import { usePreviousPrescriptions } from "../hooks/usePreviousPrescriptions";

export default function PreviousPrescriptions() {
  const { prescriptions, loading, error } = usePreviousPrescriptions();

  if (loading) return <p>Loading prescriptions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Previous Prescriptions</h2>
      <div className="overflow-x-auto w-[73dvw]">
        <table className="border border-gray-300 w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Order Date</th>
              <th className="border px-2 py-1">Category</th>
              <th className="border px-2 py-1">Generic</th>
              <th className="border px-2 py-1">Brand</th>
              <th className="border px-2 py-1">Dosage</th>
              <th className="border px-2 py-1">Unit</th>
              <th className="border px-2 py-1">Form</th>
              <th className="border px-2 py-1">Frequency</th>
              <th className="border px-2 py-1">Duration</th>
              <th className="border px-2 py-1">Instructions</th>
              <th className="border px-2 py-1">Prescribed Qty</th>
              <th className="border px-2 py-1">Dispensed Qty</th>
              <th className="border px-2 py-1">Prescribed By</th>
              <th className="border px-2 py-1">Dispensed By</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.length > 0 ? (
              prescriptions.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">{d.order_date}</td>
                  <td className="border px-2 py-1">{d.category}</td>
                  <td className="border px-2 py-1">{d.generic_name}</td>
                  <td className="border px-2 py-1">{d.brand_name}</td>
                  <td className="border px-2 py-1">{d.dosage_value}</td>
                  <td className="border px-2 py-1">{d.dosage_unit}</td>
                  <td className="border px-2 py-1">{d.form}</td>
                  <td className="border px-2 py-1">{d.frequency}</td>
                  <td className="border px-2 py-1">{d.duration}</td>
                  <td className="border px-2 py-1">{d.instructions}</td>
                  <td className="border px-2 py-1">{d.prescribed_quantity}</td>
                  <td className="border px-2 py-1">{d.dispensed_quantity}</td>
                  <td className="border px-2 py-1">{d.prescribed_by}</td>
                  <td className="border px-2 py-1">{d.dispensed_by}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={14} className="text-center py-2">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
