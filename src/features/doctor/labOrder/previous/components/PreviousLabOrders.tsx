"use client";

import { usePatient } from "@/contexts/PatientIdContext";
import { ChevronDown, FlaskConical, History } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { usePreviousLabOrders } from "../hooks/usePreviousLabOrders";

export default function PreviousLabOrders() {
  const { patientId } = usePatient();
  const { previousData, loading } = usePreviousLabOrders();
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    setIsCollapsed(true);
  }, [patientId]);

  const recentOrders = previousData.slice(0, 5);
  const summaryText = useMemo(() => {
    return Array.from(new Set(recentOrders.map((item) => item.test_name).filter(Boolean)))
      .slice(0, 3)
      .join(" • ");
  }, [recentOrders]);

  const openFullHistory = () => {
    window.dispatchEvent(new CustomEvent("switch-doctor-tab", { detail: { tab: "pastVisits" } }));
  };

  return (
    <section className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Lab History
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black tracking-tight text-slate-900">Previous lab orders</h3>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                {patientId ? `${previousData.length} recent orders` : "Waiting for patient"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {patientId
                ? summaryText || "Expand to review recent lab requests before ordering new tests."
                : "Select a patient from the queue to load previous lab orders."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openFullHistory}
              disabled={!patientId}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              View Full History
            </button>
            <button
              type="button"
              onClick={() => setIsCollapsed((value) => !value)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              aria-expanded={!isCollapsed}
              aria-controls="previous-lab-orders-panel"
            >
              <ChevronDown size={16} className={`transition-transform ${isCollapsed ? "" : "rotate-180"}`} />
              {isCollapsed ? "Expand" : "Collapse"}
            </button>
          </div>
        </div>

        {patientId && recentOrders.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {recentOrders.map((item) => (
              <span
                key={item.order_id}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-600"
              >
                {item.test_name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div id="previous-lab-orders-panel" className={isCollapsed ? "mt-4 hidden" : "mt-4"}>
        {!patientId ? (
          <div className="flex min-h-[6rem] flex-col items-center justify-center gap-3 rounded-[1rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
            <History size={22} className="text-slate-300" />
            <div>
              <h4 className="text-base font-black tracking-tight text-slate-900">No patient selected</h4>
              <p className="mt-1 text-sm text-slate-500">
                Select a patient from the queue to review previous lab orders.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex min-h-[6rem] items-center justify-center rounded-[1rem] border border-slate-100 bg-slate-50/70 text-sm font-medium text-slate-500">
            Loading previous lab orders...
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="overflow-hidden rounded-[1rem] border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Test</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Price</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Ordered By</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {recentOrders.map((item) => (
                    <tr key={item.order_id} className="border-t border-slate-200">
                      <td className="px-4 py-2.5 font-medium text-slate-700">{item.order_date}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                            <FlaskConical size={14} />
                          </div>
                          <span className="font-bold text-slate-800">{item.test_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{item.category}</td>
                      <td className="px-4 py-2.5 text-slate-600">{item.price}</td>
                      <td className="px-4 py-2.5">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{item.ordered_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-[1rem] border border-slate-200 bg-slate-50/70 px-4 py-5 text-center text-sm text-slate-400">
            No lab orders available for this patient yet.
          </div>
        )}
      </div>
    </section>
  );
}
