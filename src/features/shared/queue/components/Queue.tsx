"use client";
import { useQueue } from "../hooks/useQueue";
import { usePatient } from "@/contexts/PatientIdContext";
import { Search } from "lucide-react";

export function Queue() {
  const { setPatientId } = usePatient();
  const {
    queue,
    loading,
    selectedQueue,
    setSelectedQueue,
    filterByName,
    deleteVisit,
  } = useQueue();

  return (
    <div className="h-full p-4 space-y-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl flex flex-col">
      {/* Queue Header & Filters */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-green-900/80 px-2 flex items-center justify-between">
          Patient Queue
          {loading && <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />}
        </h2>

        <div className="p-1 gap-1 bg-black/5 rounded-2xl flex items-center">
          {["ALL", "OPD", "Emergency"].map((type) => (
            <button
              key={type}
              className={`flex-1 py-1.5 text-sm font-medium transition-all ${selectedQueue === type
                  ? "bg-white shadow-sm rounded-xl text-green-800 border-white/50 border"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setSelectedQueue(type as any)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          className="bg-white/50 backdrop-blur-sm border border-black/5 focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 p-2 pl-10 rounded-xl w-full outline-none transition-all placeholder:text-gray-400 text-sm"
          placeholder="Search patient..."
          onChange={(e) => filterByName(e.target.value)}
        />
      </div>

      {/* Queue List Container */}
      <div className="flex-1 min-h-0 custom-scrollbar overflow-auto pr-1 space-y-3">
        {loading && queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-2">
            <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-600 rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading patients...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <p className="text-sm italic">Queue is clear</p>
          </div>
        ) : (
          queue.map((p) => (
            <div
              key={p.patient_id}
              className="group relative bg-white/60 hover:bg-white backdrop-blur-sm p-3 border border-white/40 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border-l-4 border-l-green-500/30 hover:border-l-green-500"
              onClick={() => setPatientId(p.patient_id)}
            >
              <button
                className="absolute right-2 top-2 h-7 w-7 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 grid place-items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteVisit(p.patient_id);
                }}
              >
                <Search size={14} className="rotate-45" /> {/* Placeholder for X delete icon if lucide X is not explicitly loaded, but Lucide usually has X */}
                <span className="sr-only">Delete</span>
              </button>

              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded leading-none uppercase">
                      #{p.clinic_number}
                    </span>
                    <h3 className="font-bold text-slate-800 truncate max-w-[140px]">
                      {p.patient_name}
                    </h3>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium flex flex-col space-y-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Dr. {p.doctor_name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      {p.visit_type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Indicator Bar */}
              <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500/50 w-1/3 rounded-full" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
