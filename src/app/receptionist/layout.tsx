"use client";
import {
  PatientContextProvider,
  usePatient,
} from "@/contexts/PatientIdContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/src/components/ui/Button";
import { logoutUser } from "@/src/features/Login/api";
import Image from "next/image";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
export default function Receptionist({
  queue,
  queueManagement,
  patientRegistration,
  patientVitals,
  clinicalDetails,
  sidebar,
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
  const { activeTab } = useSidebar();
  const [user, setUser] = useState<any>();

  console.log(activeTab);


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

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right mr-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receptionist Desk</span>
            <span className="text-sm font-bold text-slate-700 capitalize">Active Session</span>
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              await logoutUser();
              redirect("/");
            }}
            className="rounded-xl border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-bold px-6 h-11"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Left Side: Queue (Fixed width for predictability) */}
        <aside className="w-80 flex flex-col h-full animate-in slide-in-from-left duration-500">
          {queue}
        </aside>

        {/* Right Side: Tabbed Components */}
        <section className="flex-1 flex flex-col h-full space-y-4 min-w-0">
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
