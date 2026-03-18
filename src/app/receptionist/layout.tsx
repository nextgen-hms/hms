"use client";
import {
  usePatient,
} from "@/contexts/PatientIdContext";
import { SessionControls } from "@/src/components/session/SessionControls";
import Image from "next/image";
import { fetchPatientInfo } from "@/src/features/reception/queueManagement/api";
import { useEffect, useState } from "react";
export default function Receptionist({
  queue,
  queueManagement,
  patientRegistration,
  patientVitals,
  clinicalDetails,
  sidebar: _sidebar,
}: {
  queue: React.ReactNode;
  queueManagement: React.ReactNode;
  patientRegistration: React.ReactNode;
  patientVitals: React.ReactNode;
  clinicalDetails: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  const [selectedTab, setSelectedTab] = useState("queue");
  const { patientId } = usePatient();
  const [activePatientData, setActivePatientData] = useState<any>(null);

  void _sidebar;

  // Listen for programmatic tab switches
  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      if (e.detail?.tab) {
        setSelectedTab(e.detail.tab);
      }
    };
    window.addEventListener("switch-reception-tab", handleSwitchTab);
    return () => window.removeEventListener("switch-reception-tab", handleSwitchTab);
  }, []);

  // Fetch patient info when ID changes
  useEffect(() => {
    if (patientId) {
      fetchPatientInfo(patientId)
        .then(data => setActivePatientData(data))
        .catch(() => setActivePatientData(null));
    } else {
      setActivePatientData(null);
    }
  }, [patientId]);


  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden">
      {/* Premium Header */}
      <header className="h-20 flex items-center justify-between px-8 bg-white/70 backdrop-blur-md border-b border-slate-200 z-10">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center p-2 shadow-sm border border-emerald-200">
            <Image src="/logo.png" alt="Clinic Logo" width={32} height={32} className="object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
              Dr. Fauzia Ishaq&apos;s Clinic
            </h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-1">
              Smart Care Management
            </p>
          </div>
        </div>

        <SessionControls />
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Left Side: Queue (Fixed width for predictability) */}
        <aside className="w-80 flex flex-col h-full animate-in slide-in-from-left duration-500">
          {queue}
        </aside>

        {/* Right Side: Tabbed Components */}
        <section className="flex-1 flex flex-col h-full space-y-4 min-w-0">
          <div className="flex items-center justify-between gap-4">
            {/* Dashboard Navigation Tabs */}
            <nav className="flex items-center gap-1 p-1 bg-slate-200/50 backdrop-blur-sm rounded-2xl w-fit border border-slate-200/50">
              {[
                { id: "queue", label: "Queue Entry", icon: "📋" },
                { id: "patientRegistration", label: "New Patient", icon: "👤" },
                { id: "patientVitals", label: "Vital Signs", icon: "🌡️" },
                { id: "clinicalDetails", label: "Clinical Record", icon: "🩺" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedTab === tab.id
                    ? "bg-white text-emerald-700 shadow-lg shadow-emerald-900/10 border border-slate-100"
                    : "text-slate-500 hover:bg-white/50 hover:text-slate-700"
                    }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Active Patient Badge */}
            {activePatientData && (
              <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-sm">
                  {activePatientData.patient_name?.[0]?.toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-emerald-900 truncate uppercase tracking-tight">
                    {activePatientData.patient_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-emerald-600/70 bg-emerald-100/50 px-1.5 py-0.5 rounded-md">
                      ID: {patientId}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      • {activePatientData.gender}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Content Window */}
          <div className="flex-1 bg-white/40 backdrop-blur-sm border border-slate-200 rounded-[2.5rem] relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 overflow-auto p-4 custom-scrollbar">
              <div className="animate-in fade-in zoom-in-95 duration-300 h-full">
                {selectedTab === "queue" && queueManagement}
                {selectedTab === "patientRegistration" && patientRegistration}
                {selectedTab === "patientVitals" && patientVitals}
                {selectedTab === "clinicalDetails" && clinicalDetails}
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
