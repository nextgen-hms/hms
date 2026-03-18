"use client";

import { usePastVisits } from "../hooks/usePastVisits";

export default function PastVisits() {
  const { visits, previousPrescriptions, loading } = usePastVisits();

  if (!visits.length && !previousPrescriptions.length && !loading) {
    return (
      <div className="h-full flex items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/60 text-slate-500">
        Select a patient to review visit history and previous prescriptions.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
              Visit History
            </p>
            <h2 className="mt-2 text-xl font-black text-slate-800">Past Visits</h2>
            <p className="text-sm text-slate-500">Doctor-owned visit history for the selected patient.</p>
          </div>
          {loading && <span className="text-sm text-slate-400">Loading...</span>}
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/90">
                <tr className="text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-4 py-3">Visit</th>
                  <th className="px-4 py-3">Clinic No</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Doctor</th>
                </tr>
              </thead>
              <tbody>
                {visits.length > 0 ? (
                  visits.map((visit) => (
                    <tr key={visit.visit_id} className="border-t border-slate-100">
                      <td className="px-4 py-4 text-slate-700 font-medium">{visit.visit_timestamp}</td>
                      <td className="px-4 py-4 text-slate-700">#{visit.clinic_number ?? "-"}</td>
                      <td className="px-4 py-4 text-slate-700">{visit.visit_type}</td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                          {visit.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{visit.reason || "-"}</td>
                      <td className="px-4 py-4 text-slate-600">{visit.doctor_name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                      No historical visits available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
        <div className="mb-4">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            Medication History
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-800">Previous Prescriptions</h2>
          <p className="text-sm text-slate-500">Medication history written by the logged-in doctor.</p>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/90">
                <tr className="text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Medicine</th>
                  <th className="px-4 py-3">Dose</th>
                  <th className="px-4 py-3">Frequency</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {previousPrescriptions.length > 0 ? (
                  previousPrescriptions.map((prescription) => (
                    <tr
                      key={`${prescription.prescription_id}-${prescription.order_date}-${prescription.brand_name}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-4 text-slate-700 font-medium">{prescription.order_date}</td>
                      <td className="px-4 py-4 text-slate-700">
                        {prescription.generic_name} / {prescription.brand_name}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {prescription.dosage_value} {prescription.dosage_unit}
                      </td>
                      <td className="px-4 py-4 text-slate-600">{prescription.frequency}</td>
                      <td className="px-4 py-4 text-slate-600">{prescription.duration}</td>
                      <td className="px-4 py-4 text-slate-600">{prescription.prescribed_quantity}</td>
                      <td className="px-4 py-4 text-slate-600">{prescription.instructions || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      No prescription history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
