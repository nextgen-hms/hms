"use client";
import { useState, useEffect } from "react";
import { usePatient } from "@/contexts/PatientIdContext";

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

export default function PharmacyOrder() {
  const { patientId, setPatientId } = usePatient();
  const [pId, setpId] = useState<string>("");
  const [data, setData] = useState<Prescription[]>([]);
  const [dispensed, setDispensed] = useState<boolean[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(true);

  // Fetch prescriptions
  async function getPrescriptions() {
    const res = await fetch(`/api/perscription/${patientId}`);
    const resdata = await res.json();
    setData(resdata.prescriptions);
    setDispensed(new Array(resdata.prescriptions.length).fill(true)); // all checked
  }

  // Handle checkbox change for one row
  const handleCheckboxChange = (index: number) => {
    const updated = [...dispensed];
    updated[index] = !updated[index];
    setDispensed(updated);

    // Update select all checkbox
    if (updated.every(Boolean)) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setDispensed(new Array(data.length).fill(newValue));
  };

  // Dispense selected medicines
  const dispenseMedicine = async () => {
    const medicinesToDispense = data.filter((_, idx) => dispensed[idx]);
    console.log("Dispensing:", medicinesToDispense);

    // Example API call:
    const res=await fetch(`/api/dispense/${patientId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicines: medicinesToDispense }),
    });
     console.log(await res.json());
     

  };

 

  // On patient change
  useEffect(() => {
    if (patientId) {
      setpId(patientId);
      getPrescriptions();
    }
  }, [patientId]);

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

      {/* Prescriptions Table */}
      <div>
        <h1 className="py-2 mb-2 text-3xl font-semibold border-b-2 w-fit">
          Prescriptions
        </h1>
        <table className="border border-gray-300 w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
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
            {data.length > 0 ? (
              data.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={dispensed[i] || false}
                      onChange={() => handleCheckboxChange(i)}
                    />
                  </td>
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
                <td colSpan={11} className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-6 col-span-2 pt-6">
        <button
          className="bg-gradient-to-r w-[20%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
          onClick={dispenseMedicine}
        >
          Dispense Medicine
        </button>
       
      </div>
    </div>
  );
}
