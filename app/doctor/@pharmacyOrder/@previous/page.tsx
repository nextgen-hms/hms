"use client";

import { useEffect, useState } from "react";
import { usePatient } from "@/contexts/PatientIdContext";

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
  form:string;
};

export default function PreviousPrescriptions() {
  const { patientId } = usePatient();
  const [previousData, setPreviousData] = useState<Prescription[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!patientId) return;
      const res = await fetch(`/api/prescription/${patientId}`);
      const data = await res.json();
      data.forEach((d: any) => {
        d.order_date = d.order_date?.split("T")[0];
      });
      setPreviousData(data);
    }
    fetchData();
  }, [patientId]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Previous Prescriptions
      </h2>
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
            {previousData.length > 0 ? (
              previousData.map((d, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{d.order_date}</td>
                  <td className="border px-2 py-1">{d.category}</td>
                  <td className="border px-2 py-1">{d.generic_name}</td>
                  <td className="border px-2 py-1">{d.brand_name}</td>
                  <td className="border px-2 py-1">
                    {d.dosage_value}
                  </td>
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
                <td colSpan={13} className="text-center py-2">
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
