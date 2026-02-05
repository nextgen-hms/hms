// features/pastVisits/components/PastVisits.tsx

"use client";
import { useState } from "react";
import { usePastVisits } from "../hooks/usePastVisits";

export default function PastVisits() {
  const { visits, previousPrescriptions, loading } = usePastVisits();
  const [pId, setpId] = useState("");

  return (
    <div>
      {/* Patient ID input */}
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
              // Trigger context update if needed
            }
          }}
        />
      </div>

      {/* Past Visits Table */}
      <div className="mt-6">
        <h1 className="py-2 mb-2 text-3xl font-semibold border-b-2 w-fit">
          Past Visits
        </h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : visits.length > 0 ? (
          <table className="border border-gray-300 w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Patient ID</th>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Age</th>
                <th className="border px-2 py-1">Gender</th>
                <th className="border px-2 py-1">Clinic No</th>
                <th className="border px-2 py-1">Doctor</th>
                <th className="border px-2 py-1">Visit Type</th>
                <th className="border px-2 py-1">Reason</th>
                <th className="border px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{v.patientId}</td>
                  <td className="border px-2 py-1">{v.patientName}</td>
                  <td className="border px-2 py-1">{v.age}</td>
                  <td className="border px-2 py-1">{v.gender}</td>
                  <td className="border px-2 py-1">{v.clinicNo}</td>
                  <td className="border px-2 py-1">{v.doctor}</td>
                  <td className="border px-2 py-1">{v.visitType}</td>
                  <td className="border px-2 py-1">{v.visitReason}</td>
                  <td className="border px-2 py-1">{v.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No visits found for this patient</p>
        )}
      </div>

      {/* Previous Prescriptions Table */}
      <div className="mt-6">
        <h1 className="py-2 mb-2 text-3xl font-semibold border-b-2 w-fit">
          Previous Prescriptions
        </h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : previousPrescriptions.length > 0 ? (
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
              {previousPrescriptions.map((p, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{p.orderDate}</td>
                  <td className="border px-2 py-1">{p.category}</td>
                  <td className="border px-2 py-1">{p.generic}</td>
                  <td className="border px-2 py-1">{p.brandName}</td>
                  <td className="border px-2 py-1">{p.dose}</td>
                  <td className="border px-2 py-1">{p.quantity}</td>
                  <td className="border px-2 py-1">{p.frequency}</td>
                  <td className="border px-2 py-1">{p.duration}</td>
                  <td className="border px-2 py-1">{p.unit}</td>
                  <td className="border px-2 py-1">{p.prescribedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No previous prescriptions found</p>
        )}
      </div>
    </div>
  );
}
