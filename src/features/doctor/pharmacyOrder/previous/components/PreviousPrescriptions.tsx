"use client";

import { usePatient } from "@/contexts/PatientIdContext";
import { ChevronDown, History, Pill } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { usePreviousPrescriptions } from "../hooks/usePreviousPrescriptions";

export default function PreviousPrescriptions() {
  const { patientId } = usePatient();
  const { prescriptions, loading, error } = usePreviousPrescriptions();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    setIsCollapsed(true);
    setExpandedKey(null);
  }, [patientId]);

  const recentPrescriptions = prescriptions.slice(0, 5);
  const summaryText = useMemo(() => {
    const unique = Array.from(new Set(recentPrescriptions.map((item) => item.brand_name).filter(Boolean)));
    return unique.slice(0, 3).join(" • ");
  }, [recentPrescriptions]);

  const openFullHistory = () => {
    window.dispatchEvent(new CustomEvent("switch-doctor-tab", { detail: { tab: "pastVisits" } }));
  };

  return (
    <section className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
              Prescriptions by you
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-black tracking-tight text-slate-900">
                Prescriptions by you
              </h3>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600">
                {patientId ? `${prescriptions.length} recent lines` : "Waiting for patient"}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {patientId
                ? summaryText || "Expand to review recent medication choices before prescribing."
                : "Select a patient from the queue to load previous prescriptions."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openFullHistory}
              disabled={!patientId}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              View Full History
            </button>
            <button
              type="button"
              onClick={() => setIsCollapsed((value) => !value)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-expanded={!isCollapsed}
              aria-controls="previous-prescriptions-panel"
            >
              <ChevronDown
                size={16}
                className={`transition-transform ${isCollapsed ? "" : "rotate-180"}`}
              />
              {isCollapsed ? "Expand" : "Collapse"}
            </button>
          </div>
        </div>

        {patientId && recentPrescriptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {recentPrescriptions.map((item, index) => (
              <span
                key={`${item.order_date}-${item.brand_name}-${index}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-600"
              >
                {item.brand_name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div id="previous-prescriptions-panel" className={isCollapsed ? "mt-4 hidden" : "mt-4"}>
        {!patientId ? (
          <div className="flex min-h-[8rem] flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
            <History size={22} className="text-slate-300" />
            <div>
              <h4 className="text-base font-black tracking-tight text-slate-900">No patient selected</h4>
              <p className="mt-1 text-sm text-slate-500">
                Choose a patient from the queue to review prior prescriptions.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex min-h-[8rem] items-center justify-center rounded-[1.5rem] border border-slate-100 bg-slate-50/70 text-sm font-medium text-slate-500">
            Loading prescription history...
          </div>
        ) : error ? (
          <div className="rounded-[1.5rem] border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : recentPrescriptions.length > 0 ? (
          <div className="space-y-3">
            {recentPrescriptions.map((item, index) => {
              const rowKey = `${item.order_date}-${item.brand_name}-${index}`;
              const isExpanded = expandedKey === rowKey;

              return (
                <article
                  key={rowKey}
                  className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedKey(isExpanded ? null : rowKey)}
                    className="flex w-full flex-col gap-4 px-4 py-4 text-left transition hover:bg-slate-50/80 lg:flex-row lg:items-center lg:justify-between"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <Pill size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                            {item.order_date}
                          </span>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                            {item.category}
                          </span>
                        </div>
                        <div className="mt-2 text-base font-black tracking-tight text-slate-900">
                          {item.brand_name}
                        </div>
                        <div className="text-sm text-slate-500">{item.generic_name}</div>
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3 lg:min-w-[460px]">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Dose
                        </div>
                        <div className="mt-1 font-semibold">
                          {item.dosage || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Frequency
                        </div>
                        <div className="mt-1 font-semibold">{item.frequency || "-"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Duration
                        </div>
                        <div className="mt-1 font-semibold">{item.duration || "-"}</div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-4">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Form
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-700">
                            {item.form || "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Prescribed Qty
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-700">
                            {item.prescribed_quantity}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Dispensed Qty
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-700">
                            {item.dispensed_quantity}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Prescribed By
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-700">
                            {item.prescribed_by || "-"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-[1rem] border border-slate-200 bg-white px-4 py-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Instructions
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                          {item.instructions || "No instructions recorded."}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-400">
            No prescription history available for this patient yet.
          </div>
        )}
      </div>
    </section>
  );
}
