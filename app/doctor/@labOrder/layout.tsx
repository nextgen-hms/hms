"use client";

import { usePatient } from "@/contexts/PatientIdContext";
import { useState } from "react";

export default function LabOrderLayout({
  previous,
  orderform,
}: {
  previous: React.ReactNode;
  orderform: React.ReactNode;
}) {
  const [pId, setpId] = useState("");
  const { patientId, setPatientId } = usePatient();

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-4xl font-bold">Lab Orders</h1>

      {/* Patient ID Input */}
      <div className="flex flex-col">
        <label
          htmlFor="patientId"
          className="text-sm px-2 pb-1 text-black/70"
        >
          Patient Id :
        </label>
        <input
          className="bg-gray-200 rounded-2xl w-[80%] p-2"
          id="patientId"
          type="text"
          placeholder="Enter existing Patient Id"
          onChange={(e) => setpId(e.target.value)}
          value={pId}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPatientId(pId);
              e.preventDefault();
            }
          }}
        />
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[57dvh] scrollbar-gutter-stable">
        {/* Left side: previous orders */}
        <div className="border rounded-lg p-4 shadow">{previous}</div>

        {/* Right side: new lab order form */}
        <div className="border rounded-lg p-4 shadow">{orderform}</div>
      </div>
    </div>
  );
}
