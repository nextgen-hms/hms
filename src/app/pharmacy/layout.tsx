"use client"
import { PatientContextProvider } from "@/contexts/PatientIdContext";
import Image from "next/image";
import { useState } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { logoutUser } from "@/src/features/Login/api";
import { UserProfile } from "./components/UserProfile";
import {
  ShoppingCart,
  RotateCcw,
  PlusCircle,
  History,
  Users,
  ArrowLeftRight,
  LogOut,
  Layout
} from "lucide-react";

export default function Pharmacist({
  retail,
  returnMedicine,
  purchase
}: {
  retail: React.ReactNode;
  returnMedicine: React.ReactNode;
  purchase: React.ReactNode;
}) {
  const [selectedTab, setSelectedTab] = useState("retail");

  const tabs = [
    { id: "retail", label: "Retail", icon: <ShoppingCart size={16} /> },
    { id: "returnMedicine", label: "Return", icon: <RotateCcw size={16} /> },
    { id: "purchases", label: "Purchases", icon: <PlusCircle size={16} /> },
    { id: "ledger", label: "Ledger", icon: <History size={16} /> },
    { id: "addParty", label: "Parties", icon: <Users size={16} /> },
    { id: "purchaseReturn", label: "P. Return", icon: <ArrowLeftRight size={16} /> },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8fafc] font-sans">
      {/* Premium Clinic Header */}
      <div className="px-6 py-3 border-b border-slate-200/60 bg-white shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-10 w-10 bg-emerald-50 rounded-xl p-1.5 flex items-center justify-center border border-emerald-100/50">
            <Image src="/logo.png" alt="Clinic Logo" width={28} height={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent leading-none">
              Fouzia Ishaq Clinic
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pharmacy Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Live Session</span>
          </div>

          {/* User Profile Display */}
          <UserProfile />

          <Button
            variant="outline"
            className="rounded-xl border-slate-200 hover:border-rose-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-all gap-2 h-10"
            onClick={async () => {
              await logoutUser();
              redirect("/");
            }}
          >
            <LogOut size={16} />
            <span className="font-bold text-sm">Logout</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 p-6 overflow-hidden">
        <PatientContextProvider>
          <div className="flex flex-col flex-1 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 overflow-hidden relative">

            {/* Header with Switcher */}
            <div className="p-6 flex items-center justify-between border-b border-slate-100/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                  <Layout size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 leading-none">Dashboard View</h2>
                  <p className="text-[12px] text-slate-400 font-medium mt-1 uppercase tracking-tight">Active Module: {selectedTab}</p>
                </div>
              </div>

              {/* Enhanced Tab Switcher */}
              <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/40">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-300
                      ${selectedTab === tab.id
                        ? "bg-white text-emerald-600 shadow-sm border border-slate-200/60 scale-[1.05]"
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
                      }
                    `}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Parallel Route Content Wrapper */}
            <div className="flex-1 overflow-auto custom-scrollbar p-6">
              <div className="h-full w-full animate-in fade-in zoom-in-95 duration-500">
                {selectedTab === "retail" && retail}
                {selectedTab === "returnMedicine" && returnMedicine}
                {selectedTab === "purchases" && purchase}
                {["ledger", "addParty", "purchaseReturn"].includes(selectedTab) && (
                  <div className="flex items-center justify-center h-full opacity-30 italic text-slate-500">
                    {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Module View
                  </div>
                )}
              </div>
            </div>
          </div>
        </PatientContextProvider>
      </div>
    </div>
  );
}
