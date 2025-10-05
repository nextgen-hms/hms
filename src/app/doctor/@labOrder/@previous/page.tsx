"use client";

import { useEffect, useState } from "react";
import { usePatient } from "@/contexts/PatientIdContext";

type LabOrder = {
  order_id: number;
  test_name: string;
  category: string;
  price: number;
  status: string;
  ordered_by: string;
  performed_by: string | null;
  order_date: string;
};

export default function PreviousLabOrders() {
  const { patientId } = usePatient();
  const [previousData, setPreviousData] = useState<LabOrder[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!patientId) return;
      const res = await fetch(`/api/labTests/${patientId}`);
      const data = await res.json();
      console.log(data);
      
     data.forEach((d:any)=>{
       d.order_date =d.order_date.split("T")[0];
     })
      setPreviousData(data);
    }
    fetchData();
  }, [patientId]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Previous Lab Orders</h2>
      <div className="overflow-x-auto w-[73dvw]">
        <table className="border border-gray-300 w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Order Date</th>
              <th className="border px-2 py-1">Test Name</th>
              <th className="border px-2 py-1">Category</th>
              <th className="border px-2 py-1">Price</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Ordered By</th>
              <th className="border px-2 py-1">Performed By</th>
            </tr>
          </thead>
          <tbody>
            {previousData.length > 0 ? (
              previousData.map((d, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{d.order_date}</td>
                  <td className="border px-2 py-1">{d.test_name}</td>
                  <td className="border px-2 py-1">{d.category}</td>
                  <td className="border px-2 py-1">{d.price}</td>
                  <td className="border px-2 py-1">{d.status}</td>
                  <td className="border px-2 py-1">{d.ordered_by}</td>
                  <td className="border px-2 py-1">
                    {d.performed_by || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-2">
                  No lab orders available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
