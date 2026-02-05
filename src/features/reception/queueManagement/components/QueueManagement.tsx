"use client";
import { ChangeEvent, KeyboardEvent } from "react";
import { usePatientForm } from "../hooks/usePatientForm";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Label } from "@/src/components/ui/Label";

export function PatientForm() {
  const {
    pId,
    setpId,
    patientName,
    setPatientName,
    age,
    setAge,
    gender,
    setGender,
    visitReason,
    setVisitReason,
    doctor,
    setDoctor,
    visitType,
    setVisitType,
    clinicNo,
    doctors,
    getPatientInfo,
    addToQueue,
    updateInfo,
    resetInfo,
    patientId,
    setPatientId,
  } = usePatientForm();

  const handlePatientIdKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (pId === patientId) getPatientInfo();
      setPatientId(pId);
      e.preventDefault();
    }
  };

  return (
    <div className="w-full h-full border-black/30 rounded-4xl">
      <div className="w-2/3 p-4 grid grid-cols-2 gap-5 rounded-2xl border-black/30">
        {/* Patient ID */}
        <div>
        <Label>Patient Id:</Label>
        <Input
         
          value={pId}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setpId(e.target.value)
          }
          onKeyDown={handlePatientIdKeyDown}
          placeholder="Enter patient ID"
          className="w-[80%]"
        />
       </div>
        {/* Clinic No */}
         <div>
        <Label>Clinic No:</Label>
        <Input
          
          value={clinicNo}
          disabled
          className="w-[80%]"
        />
         </div>
        {/* Patient Name */}
         <div>
        <Label>Patient Name:</Label>
        <Input
         
          value={patientName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPatientName(e.target.value)
          }
          placeholder="Enter patient name"
          className="w-[80%]"
        />
        </div>
        {/* Age */}
         <div>
        <Label>Age:</Label>
        <Input
          
          type="number"
          value={age}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setAge(e.target.value)
          }
          placeholder="Enter age"
          className="w-[80%]"
        />
        </div>
        {/* Gender */}
        <SelectField
          label="Gender"
          value={gender}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setGender(e.target.value)
          }
          options={[
            { label: "Male", value: "Male" },
            { label: "Female", value: "Female" },
          ]}
        />

        {/* Visit Reason */}
         <div>
        <Label>Patient Id:</Label>
        <Input
        
          value={visitReason}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setVisitReason(e.target.value)
          }
          placeholder="Reason for visit"
          className="w-[80%]"
        />
       </div>
        {/* Select Doctor */}
        <SelectField
          label="Select Doctor"
          value={doctor}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setDoctor(e.target.value)
          }
          options={doctors.map(
            (d: { doctor_name: string; doctor_id: string }) => ({
              label: d.doctor_name,
              value: d.doctor_id,
            })
          )}
        />

        {/* Visit Type */}
        <SelectField
          label="Visit Type"
          value={visitType}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setVisitType(e.target.value)
          }
          options={[
            { label: "OPD", value: "OPD" },
            { label: "Emergency", value: "Emergency" },
          ]}
        />

        {/* Buttons */}
        <div className="col-span-2 flex gap-4 pt-4">
          <Button variant="default" onClick={() => addToQueue()} className="flex-1">
            Add To Queue
          </Button>
          <Button variant="secondary" onClick={() => updateInfo()} className="flex-1">
            Update Info
          </Button>
          <Button variant="outline" onClick={() => resetInfo()} className="flex-1">
            Reset Info
          </Button>
        </div>
      </div>
    </div>
  );
}

// 🔹 Select Field (Keep this for now, can be moved to components/ui later)
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700 px-2">{label}</label>
      <select
        className="bg-gray-100 w-[80%] px-4 py-2 rounded-lg border border-gray-300 outline-none text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        value={value ?? ""}
        onChange={onChange}
      >
        <option value="" disabled hidden>
          Select
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}