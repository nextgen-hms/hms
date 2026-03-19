// features/patient-vitals/components/PatientVitalsForm.tsx
"use client";

import { usePatientVitals } from "../hooks/usePatientVitals";
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Ruler, 
  Weight as WeightIcon, 
  Droplets,
  Search,
  User,
  History,
  AlertCircle
} from "lucide-react";

export function PatientVitalsForm() {
  const {
    patientId,
    selectedVisitId,
    register,
    handleSubmit,
    errors,
    addPatient,
    updateInfo,
    mode,
    statusMessage,
  } = usePatientVitals();

  if (!selectedVisitId) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white/30 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-[3rem] text-center p-12">
        <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-4xl mb-6 grayscale opacity-50 shadow-inner">
          🌡️
        </div>
        <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest leading-none mb-3">No Visit Selected</h3>
        <p className="text-sm font-black text-slate-400/60 uppercase tracking-tighter max-w-xs">
          Please select a patient from the queue on the left to record or update their vital signs.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-5">
            <div className="h-12 w-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <Thermometer className="text-white w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Biometric Intake</h2>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-emerald-200/50">
                  Visit #{selectedVisitId}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-bold mt-1 opacity-70">Capture patient vitals and physical metrics for Patient ID: {patientId}</p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white shadow-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{mode === "update" ? "Update Mode" : "New Entry"}</span>
          </div>
        </div>

        {/* Status Mode Badge */}
        <div className={`mb-8 rounded-2xl border px-5 py-4 text-xs font-bold transition-all duration-500 ${
          mode === "update" 
            ? "border-emerald-200 bg-emerald-50/50 text-emerald-800 shadow-sm" 
            : "border-blue-100 bg-blue-50/50 text-blue-700 shadow-sm"
        }`}>
          <div className="flex items-center gap-3">
            <AlertCircle className={`w-4 h-4 ${mode === "update" ? "text-emerald-500" : "text-blue-500"}`} />
            <span>{statusMessage}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(mode === "update" ? updateInfo : addPatient)} className="space-y-8">
          {/* Clinical Vitals Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-4">Core Vitals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Input
                label="Blood Pressure"
                id="bgp"
                icon={<Activity className="w-4 h-4" />}
                reg={register("blood_pressure")}
                err={errors.blood_pressure?.message}
                placeholder="120/80"
              />
              <Input
                label="Temperature"
                id="temp"
                icon={<Thermometer className="w-4 h-4" />}
                reg={register("temperature")}
                err={errors.temperature?.message}
                placeholder="98.6 °F"
              />
              <Input
                label="Heart Rate"
                id="heart_rate"
                icon={<Heart className="w-4 h-4" />}
                reg={register("heart_rate")}
                err={errors.heart_rate?.message}
                placeholder="72 BPM"
              />
            </div>
          </div>

          <div className="h-px bg-slate-100/50 w-full" />

          {/* Physical Metrics + Blood Group Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-4">Physical Attributes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Input
                label="Height"
                id="height"
                icon={<Ruler className="w-4 h-4" />}
                reg={register("height")}
                err={errors.height?.message}
                placeholder="175 cm"
              />
              <Input
                label="Weight"
                id="weight"
                icon={<WeightIcon className="w-4 h-4" />}
                reg={register("weight")}
                err={errors.weight?.message}
                placeholder="70 kg"
              />
              <Input
                label="Blood Group"
                id="blood_group"
                icon={<Droplets className="w-4 h-4" />}
                reg={register("blood_group")}
                err={errors.blood_group?.message}
                placeholder="O+"
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <Activity className="w-4 h-4" />
              {mode === "update" ? "Update Biometric Data" : "Save Biometric Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Inner Components for clean layout
function Input({ label, id, icon, reg, err, placeholder }: any) {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={id} className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-all">
          {icon}
        </div>
        <input
          id={id}
          {...reg}
          placeholder={placeholder}
          className="w-full h-12 pl-12 pr-4 bg-white/60 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
        />
      </div>
      {err && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-tighter">! {err}</p>}
    </div>
  );
}
