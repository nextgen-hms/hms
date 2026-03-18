"use client";

import { usePatient } from "@/contexts/PatientIdContext";
import { useEffect, useState } from "react";
import Gynaecologist from "./Gynacologist/Gynaecologist";

export default function ClinicalRecordsLayout() {
  const [pId, setpId] = useState<string>("");

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
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
            Clinical Specialization
          </label>
          <div className="w-full h-12 px-4 bg-white/40 backdrop-blur-md border border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center gap-3">
            <span className="text-xl">🩺</span>
            <span>Gynaecologist</span>
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
              autoComplete="off"
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
        <div className="h-full">
          <Gynaecologist patientId={patientId} />
        </div>
      </div>
    </div>
  );
}
