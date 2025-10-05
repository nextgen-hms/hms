"use client";
import { ChangeEvent, KeyboardEvent } from "react";
import { usePatientForm } from "../hooks/usePatientForm";

export  function PatientForm() {
  const {
    pId, setpId,
    patientName, setPatientName,
    age, setAge,
    gender, setGender,
    visitReason, setVisitReason,
    doctor, setDoctor,
    visitType, setVisitType,
    clinicNo,
    doctors,
    getPatientInfo,
    addToQueue,
    updateInfo,
    resetInfo,
    patientId, setPatientId,
  } = usePatientForm();

  return (
    <div className="w-full h-full border-black/30 rounded-4xl">
      <div className="w-2/3 p-4 grid grid-cols-2 space-y-5 rounded-2xl border-black/30">
        
        {/* Patient ID */}
        <InputField
          label="Patient Id :"
          value={pId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setpId(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              if (pId === patientId) getPatientInfo();
              setPatientId(pId);
              e.preventDefault();
            }
          }}
        />

        <InputField label="Clinic No :" value={clinicNo} disabled />

        <InputField
          label="Patient Name :"
          value={patientName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPatientName(e.target.value)}
        />
        <InputField
          label="Age :"
          value={age}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setAge(e.target.value)}
        />

        <SelectField
          label="Gender :"
          value={gender}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setGender(e.target.value)}
          options={[
            { label: "Male", value: "Male" },
            { label: "Female", value: "Female" },
          ]}
        />

        <InputField
          label="Visit Reason :"
          value={visitReason}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setVisitReason(e.target.value)}
        />

        <SelectField
          label="Select Doctor :"
          value={doctor}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setDoctor(e.target.value)}
          options={doctors.map((d: { doctor_name: string; doctor_id: string }) => ({
            label: d.doctor_name,
            value: d.doctor_id,
          }))}
        />

        <SelectField
          label="Visit Type :"
          value={visitType}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setVisitType(e.target.value)}
          options={[
            { label: "OPD", value: "OPD" },
            { label: "Emergency", value: "Emergency" },
          ]}
        />

        {/* Buttons */}
        <div className="col-span-2 flex space-x-6 pt-4">
          <FormButton text="Add To Queue" onClick={addToQueue} />
          <FormButton text="Update Info" onClick={updateInfo} />
          <FormButton text="Reset Info" onClick={resetInfo} />
        </div>
      </div>
    </div>
  );
}

// 🔹 Input Field
function InputField({
  label,
  value,
  onChange,
  onKeyDown,
  disabled,
}: {
  label: string;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm px-2 pb-1 text-black/70">{label}</label>
      <input
        className="bg-gray-200 rounded-2xl w-[80%] p-2"
        value={value ?? ""}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />
    </div>
  );
}

// 🔹 Select Field
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
    <div className="flex flex-col">
      <label className="text-sm px-2 pb-1 text-black/70">{label}</label>
      <select
        className="bg-black/10 w-[80%] p-2 rounded-2xl outline-none text-black"
        value={value ?? ""}
        onChange={onChange}
      >
        <option value="" disabled hidden>Select</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// 🔹 Form Button
function FormButton({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      className="bg-gradient-to-r w-1/2 p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
      onClick={onClick}
    >
      {text}
    </button>
  );
}
