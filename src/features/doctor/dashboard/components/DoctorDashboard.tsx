"use client";

import { useDoctorDashboard } from "../hooks/useDoctorDashboard";

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | undefined;
  tone: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white/70 px-5 py-4 shadow-lg shadow-slate-900/5">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-black ${tone}`}>{value ?? 0}</p>
    </div>
  );
}

export default function DoctorDashboard() {
  const {
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    summary,
    checkedPatients,
    selectedVisitId,
    setSelectedVisitId,
    visitHistory,
    loadingSummary,
    loadingHistory,
    openPatientDetails,
  } = useDoctorDashboard();

  return (
    <div className="space-y-6 h-full">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
              Doctor Overview
            </p>
            <h2 className="text-2xl font-black text-slate-800">Doctor Dashboard</h2>
            <p className="text-sm text-slate-500 mt-1">
              Track queue load, checked patients, and visit status history with the same workspace UI.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-500 font-semibold">
              From
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700"
              />
            </label>
            <label className="text-sm text-slate-500 font-semibold">
              To
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
          <SummaryCard
            label="Assigned"
            value={summary?.assigned_total}
            tone="text-slate-900"
          />
          <SummaryCard
            label="Waiting"
            value={summary?.waiting_total}
            tone="text-amber-600"
          />
          <SummaryCard
            label="Checked"
            value={summary?.checked_total}
            tone="text-emerald-600"
          />
          <SummaryCard
            label="Other Progressed"
            value={summary?.other_progressed_total}
            tone="text-sky-600"
          />
        </div>

        {loadingSummary && (
          <p className="mt-4 text-sm text-slate-400">Refreshing dashboard...</p>
        )}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
        <section className="min-h-[24rem] rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-black text-slate-800">Checked Patients</h3>
              <p className="text-sm text-slate-500">
                Patients marked `seen_by_doctor` in the selected date range.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-[0.2em]">
              {checkedPatients.length} patients
            </span>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50/90">
                  <tr className="text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Clinic No</th>
                    <th className="px-4 py-3">Checked At</th>
                    <th className="px-4 py-3">History</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {checkedPatients.length > 0 ? (
                    checkedPatients.map((row) => (
                      <tr
                        key={row.visit_id}
                        className={`cursor-pointer border-t border-slate-100 ${
                          selectedVisitId === row.visit_id ? "bg-emerald-50/70" : ""
                        }`}
                        onClick={() => setSelectedVisitId(row.visit_id)}
                      >
                        <td className="px-4 py-4">
                          <div className="font-bold text-slate-800">{row.patient_name}</div>
                          <div className="text-xs text-slate-500">
                            ID {row.patient_id} • {row.gender} • {row.age ?? "-"} yrs
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">#{row.clinic_number ?? "-"}</td>
                        <td className="px-4 py-4 text-slate-600">{row.checked_at}</td>
                        <td className="px-4 py-4 text-slate-600">{row.history_count}</td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openPatientDetails(row);
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                          >
                            Open Patient
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                        No checked patients found for this date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="min-h-[24rem] rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <div className="mb-4">
            <h3 className="text-xl font-black text-slate-800">Visit Status History</h3>
            <p className="text-sm text-slate-500">
              Timeline for the selected checked patient.
            </p>
          </div>

          {loadingHistory && (
            <p className="text-sm text-slate-400">Loading status history...</p>
          )}

          {!loadingHistory && !visitHistory && (
            <p className="text-sm text-slate-400">
              Select a checked patient to inspect visit status history.
            </p>
          )}

          {visitHistory && (
            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-4 py-4">
                <div className="text-sm font-bold text-slate-800">
                  {visitHistory.visit.patient_name}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Visit #{visitHistory.visit.clinic_number ?? "-"} • {visitHistory.visit.visit_type} • {visitHistory.visit.visit_timestamp}
                </div>
              </div>

              {visitHistory.history.length > 0 ? (
                <div className="space-y-3">
                  {visitHistory.history.map((entry) => (
                    <div
                      key={entry.visit_status_id}
                      className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-black text-slate-800">
                          {entry.status}
                        </span>
                        <span className="text-xs text-slate-400">{entry.updated_at}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Doctor: {entry.updated_by_doctor ?? "-"} • Staff: {entry.updated_by_staff ?? "-"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/60 px-4 py-6 text-sm text-slate-400">
                  No recorded status history yet for this visit. Current visit status exists, but history rows only appear once doctor/staff transitions are logged.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
