"use client";

import { usePatient } from "@/contexts/PatientIdContext";
import { useState } from "react";

export default function PharmacyLayout({
  previous,
  prescriptionform,
}: {
  previous: React.ReactNode;
  prescriptionform: React.ReactNode;
}) {
    const [pId,setpId]=useState("");
    const {patientId,setPatientId}=usePatient();
  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-4xl font-bold">Pharmacy </h1>
        <div className="flex flex-col ">
            <label htmlFor="patientId" className="text-sm px-2 pb-1 text-black/70">Patient Id :</label>
            <input
              className="bg-gray-200 rounded-2xl  w-[80%] p-2  "
              id="patientId"
              type="text"
              placeholder="Enter existing Patient Id"
              onChange={(e) => setpId(e.target.value)}
              value={pId}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPatientId(pId)
                  e.preventDefault();
                }
              }}
            />
          </div>
      <div className="overflow-y-auto h-[57dvh] scrollbar-gutter-stable">
        {/* Left side: previous prescriptions */}
        <div className="border rounded-lg p-4 shadow">
          {previous}
        </div>

        {/* Right side: new prescription form */}
        <div className="border rounded-lg p-4 shadow">
          {prescriptionform}
        </div>
      </div>
    </div>
  );
}
