// features/patient-vitals/components/PatientVitalsForm.tsx
"use client";

import { Controller, useFormContext } from "react-hook-form";
import { usePatientVitals } from "../hooks/usePatientVitals";

export function PatientVitalsForm() {
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
    <div className="w-full h-full p-2">
      <div className="max-w-4xl mx-auto bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 p-8">
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Biometric Intake</h2>
            <p className="text-sm text-slate-500">Record patient vital signs and physical metrics</p>
          </div>
          <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center p-2 shadow-inner">
            <span className="text-2xl">🌡️</span>
          </div>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Patient ID Search */}
          <div className="flex flex-col col-span-2 md:col-span-1 space-y-1.5">
            <Label className="text-slate-600 font-semibold ml-1">Patient ID</Label>
            <div className="relative group">
              <input
                id="pid"
                type="text"
                value={pId}
                placeholder="Ex: 1001"
                className="w-full h-12 bg-white/70 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 p-4 rounded-2xl outline-none transition-all placeholder:text-gray-400 text-sm shadow-sm hover:bg-white"
                onChange={(e) => setpId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPatientId(pId);
                    e.preventDefault();
                  }
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                PRESS ENTER
              </div>
            </div>
            <ErrorMsg msg={errors.patient_id?.message} />
          </div>

          <div className="hidden md:block" /> {/* Spacing */}

          {/* Clinical Vitals */}
          <Input
            label="Blood Pressure"
            id="bgp"
            reg={register("blood_pressure")}
            err={errors.blood_pressure?.message}
            placeholder="e.g. 120/80"
          />
          <Input
            label="Temperature (°F)"
            id="temp"
            reg={register("temperature")}
            err={errors.temperature?.message}
            placeholder="e.g. 98.6"
          />
          <Input
            label="Heart Rate (BPM)"
            id="heart_rate"
            reg={register("heart_rate")}
            err={errors.heart_rate?.message}
            placeholder="e.g. 72"
          />

          {/* Physical Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Height (cm)"
              id="height"
              reg={register("height")}
              err={errors.height?.message}
              placeholder="cm"
            />
            <Input
              label="Weight (kg)"
              id="weight"
              reg={register("weight")}
              err={errors.weight?.message}
              placeholder="kg"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label className="text-slate-600 font-semibold ml-1">Blood Group</Label>
            <select
              {...register("blood_group")}
              className="h-12 bg-white/70 border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl px-4 outline-none text-sm transition-all shadow-sm hover:bg-white"
            >
              <option value="" hidden>Select Type</option>
              {["A+", "B+", "AB+", "A-", "B-", "O+", "O-"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <ButtonComp
              text="Add Vitals"
              onClick={() => handleSubmit(addPatient)()}
              variant="primary"
            />
            <ButtonComp
              text="Update Vitals"
              onClick={() => handleSubmit(updateInfo)()}
              variant="secondary"
            />
            <ButtonComp
              text="Reset Form"
              type="reset"
              variant="outline"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, id, reg, err, placeholder }: any) {
  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor={id} className="text-slate-600 font-semibold ml-1">{label}</Label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        className="h-12 bg-white/70 border border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-2xl px-4 transition-all shadow-sm hover:bg-white outline-none text-sm"
        {...reg}
      />
      <ErrorMsg msg={err} />
    </div>
  );
}

function ButtonComp({ text, onClick, type = "button", variant }: any) {
  const styles = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 active:scale-95",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700",
    outline: "border-2 border-slate-200 hover:bg-slate-50 text-slate-500"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`h-14 rounded-2xl font-bold text-lg transition-all ${styles[variant as keyof typeof styles]}`}
    >
      {text}
    </button>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  return (
    <div className="min-h-[14px] mt-1">
      {msg && <p className="text-red-500 text-[10px] ml-1">{msg}</p>}
    </div>
  );
}

import { Label } from "@/src/components/ui/Label";
