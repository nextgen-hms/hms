"use client";
import { useState, useEffect } from "react";
import { usePatient } from "@/contexts/PatientIdContext";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Select from "react-select";

// Types based on your API response
type Visit = {
  patientId: string;
  patientName: string;
  age: string;
  gender: string;
  clinicNo: string;
  doctor: string;
  status: string;
  visitReason: string;
  visitType: string;
};

type OptionType = { value: string; label: string };

type FormValues = {
  prescriptions: {
    category: OptionType | null;
    generic: OptionType | null;
    brandName: OptionType | null;
    dose: OptionType | null;
    quantity: number;
    frequency: number;
    duration: number;
    unit: OptionType | null;
  }[];
};
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
export default function PastVisits() {
  const { patientId, setPatientId } = usePatient();
  const [pId, setpId] = useState<string>("");
  const [visits, setVisits] = useState<Visit[]>([]);
   const [previousData, setPreviousData] = useState<Prescription[]>([]);
  const categoryOptions: OptionType[] = [
    { value: "iron", label: "Iron" },
    { value: "antibiotic", label: "Antibiotic" },
    { value: "sugar", label: "Sugar" },
    { value: "drugs", label: "Drugs" },
  ];

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      prescriptions: [
        {
          category: null,
          generic: null,
          brandName: null,
          dose: null,
          quantity: 1,
          frequency: 1,
          duration: 1,
          unit: null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "prescriptions",
  });

  // Fetch visits
  async function getPastVisits() {
    const res = await fetch(`/api/visit/${patientId}`);
    const resdata = await res.json();
    console.log(resdata);
    setVisits(Array.isArray(resdata) ? resdata : [resdata]); // handle single object
  }
 async function getPreviousPrescriptions() {
    const res = await fetch(`/api/perscription/${patientId}`);
    const resdata = await res.json();
    setPreviousData(resdata.prescriptions);
  }
  useEffect(() => {
    if (patientId) {
      setpId(patientId);
      getPastVisits();
      getPreviousPrescriptions();
    }
  }, [patientId]);

  const onSubmit = async (data: FormValues) => {
    if (!patientId) return;
    const res = await fetch(`/api/medicine/${patientId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    console.log(await res.json());
  };

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

      {/* Past Visits */}
      <div className="mt-6">
        <h1 className="py-2 mb-2 text-3xl font-semibold border-b-2 w-fit">
          Past Visits
        </h1>
        {visits.length > 0 ? (
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

      {/* Prescribe Medicines Section */}
      <div className="mt-6">
        <h1 className="py-2 mb-2 text-3xl font-semibold border-b-2 w-fit">
          Prescribe Medicines
        </h1>
        {/* Keep your existing prescription form code here */}
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
            {previousData.length > 0 ? (
              previousData.map((d, i) => (
                <tr key={i}>
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
                <td colSpan={10} className="text-center">
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
