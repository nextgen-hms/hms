"use client";

import { AlertTriangle } from "lucide-react";

export function StaleVisitNotice({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 px-6 py-8 shadow-[0_10px_30px_rgba(180,83,9,0.08)]">
      <div className="flex min-h-[14rem] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tight text-amber-950">{title}</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-amber-800">{message}</p>
        </div>
      </div>
    </section>
  );
}
