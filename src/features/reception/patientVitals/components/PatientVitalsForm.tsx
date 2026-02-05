// features/patient-vitals/components/PatientVitalsForm.tsx
"use client";

import { Controller, useFormContext } from "react-hook-form";
import { usePatientVitals } from "../hooks/usePatientVitals";

export  function PatientVitalsForm() {
  const {
    pId,
    setpId,
    patientId,
    setPatientId,
    register,
    handleSubmit,
    errors,
    addPatient,
    updateInfo,
  } = usePatientVitals();

  return (
    <form className="w-2/3 border-black/40 grid grid-cols-2 p-4">
      {/* Patient ID */}
      <div className="flex flex-col col-span-2">
        <label className="px-2 pb-1 text-sm text-black/70">Patient Id:</label>
        <input
          id="pid"
          type="text"
          value={pId}
          placeholder="Enter existing Patient Id"
          className="w-[40%] p-2 bg-gray-200 rounded-2xl"
          onChange={(e) => setpId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPatientId(pId);
              e.preventDefault();
            }
          }}
        />
        <ErrorMsg msg={errors.patient_id?.message} />
      </div>

      <Input label="Blood Pressure" id="bgp" reg={register("blood_pressure")} err={errors.blood_pressure?.message} />
      <Input label="Temperature" id="temp" reg={register("temperature")} err={errors.temperature?.message} />
      <Input label="Heart Rate" id="heart_rate" reg={register("heart_rate")} err={errors.heart_rate?.message} />
      <Input label="Height" id="height" reg={register("height")} err={errors.height?.message} />
      <Input label="Weight" id="weight" reg={register("weight")} err={errors.weight?.message} />

      <div className="flex flex-col">
        <label className="px-2 pb-1 text-sm text-black/70">Blood Group:</label>
        <select {...register("blood_group")} className="w-[80%] p-2 bg-gray-200 rounded-2xl">
          <option value="" hidden>Select Blood Group</option>
          {["A+", "B+", "AB+", "A-", "B-", "O+", "O-"].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex space-x-6 col-span-2 pt-6">
     <Button text="Add Vitals" onClick={() => handleSubmit(addPatient)()} />
<Button text="Update Vitals" onClick={() => handleSubmit(updateInfo)()} />
        <Button text="Reset Info" type="reset" />
      </div>
    </form>
  );
}

function Input({ label, id, reg, err }: any) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="px-2 pb-1 text-sm text-black/70">{label}:</label>
      <input id={id} type="text" className="w-[80%] p-2 bg-gray-200 rounded-2xl" {...reg} />
      <ErrorMsg msg={err} />
    </div>
  );
}

function Button({ text, onClick, type = "button" }: any) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="bg-gradient-to-r w-[20%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
    >
      {text}
    </button>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  return (
    <div className="min-h-[20px]">
      {msg && <p className="text-red-300 text-sm px-2">{msg}</p>}
    </div>
  );
}
