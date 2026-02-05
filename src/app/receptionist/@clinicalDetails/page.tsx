"use client";

import { usePatient } from "@/contexts/PatientIdContext";
import { register } from "module";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Gynaecologist from "./Gynacologist/Gynaecologist";

export default function ClinicalRecordsLayout() {
  const [pId, setpId] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("Gynaecologist");

  const { patientId, setPatientId } = usePatient();

  useEffect(() => {
    if (patientId) {
      setpId(patientId);
    }
  }, [patientId]);

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Header / Filter Section */}
      <div className="p-6 pb-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        {/* Specialization Selection */}
        <div className="space-y-2">
          <label
            htmlFor="specialization"
            className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1"
          >
            Clinical Specialization
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="text-xl">🩺</span>
            </div>
            <select
              value={specialization}
              id="specialization"
              className="w-full h-12 pl-12 pr-4 bg-white/40 backdrop-blur-md border border-slate-200 rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 appearance-none transition-all cursor-pointer hover:bg-white/60"
              onChange={(e) => setSpecialization(e.target.value)}
            >
              <option value="Gynaecologist">Gynaecologist</option>
              <option value="Daermaetologist">Dermatologist</option>
              <option value="childSpecialist">Child Specialist</option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Patient ID Sync */}
        <div className="space-y-2">
          <label
            htmlFor="pid"
            className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1"
          >
            Patient ID Verification
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="text-xl">🆔</span>
            </div>
            <input
              id="pid"
              type="text"
              placeholder="Enter ID and press Enter..."
              className="w-full h-12 pl-12 pr-4 bg-white/40 backdrop-blur-md border border-slate-200 rounded-2xl text-slate-700 font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all shadow-sm"
              value={pId}
              onChange={(e) => setpId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPatientId(pId);
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar px-6 pb-6">
        {specialization === "Gynaecologist" ? (
          <div className="h-full">
            <Gynaecologist patientId={patientId} />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <div className="text-6xl mb-4">🚧</div>
            <p className="text-xl font-black text-slate-400 uppercase tracking-tighter">
              {specialization} Module Coming Soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
