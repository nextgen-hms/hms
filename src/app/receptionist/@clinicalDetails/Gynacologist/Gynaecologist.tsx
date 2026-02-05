"use client";
import { useState } from "react";
import ParaDetailsForm from "./allForms/ParaDetaisl";
import MenstrualHistory from "./allForms/MenstrualHistory";
import CurrentPregnancy from "./allForms/CurrentPregnancy";
import ObstetricHistory from "./allForms/ObstetricHistory";

export default function Gynaecologist({
  patientId,
}: {
  patientId: string | null;
}) {
  const [selectedTab, setSelectedTab] = useState("Menstrual History");

  const tabs = [
    { id: "Menstrual History", icon: "🩸", label: "Menstrual" },
    { id: "Current Pregnancy", icon: "🤰", label: "Pregnancy" },
    { id: "Obstetric History", icon: "📋", label: "Obstetric" },
    { id: "Para Details", icon: "🔢", label: "Para" },
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Premium Tab Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 backdrop-blur-md rounded-2xl w-fit border border-slate-200/50 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`flex items-center gap-4 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${selectedTab === tab.id
                ? "bg-white text-emerald-700 shadow-md shadow-emerald-900/5 border border-slate-100 translate-y-[-1px]"
                : "text-slate-500 hover:bg-white/40 hover:text-slate-700"
              }`}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area with Animation Wrapper */}
      <div className="flex-1 min-h-0 bg-white/30 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden group">
        <div className="h-full overflow-auto custom-scrollbar p-1">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full p-6">
            {selectedTab === "Menstrual History" && <MenstrualHistory />}
            {selectedTab === "Current Pregnancy" && <CurrentPregnancy />}
            {selectedTab === "Obstetric History" && <ObstetricHistory />}
            {selectedTab === "Para Details" && <ParaDetailsForm />}
          </div>
        </div>
      </div>
    </div>
  );
}
