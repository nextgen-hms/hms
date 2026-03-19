"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CurrentPregnancySchema, CurrentPregnancyFormData } from "../types";
import { useCurrentPregnancy } from "../hooks/useCurrentPregnancy";
import { useEffect } from "react";
import { usePatient } from "@/contexts/PatientIdContext";

export default function CurrentPregnancyForm() {
  const { patientId, selectedVisitId } = usePatient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CurrentPregnancyFormData>({
    resolver: zodResolver(CurrentPregnancySchema),
    mode: "onChange",
  });

  const { fetchCurrentPregnancy, addInfo, updateInfo, mode, statusMessage } = useCurrentPregnancy(patientId, selectedVisitId);

  useEffect(() => {
    if (!patientId || !selectedVisitId) {
      reset({
        patient_id: patientId || "",
        visit_id: selectedVisitId || "",
        multiple_pregnancy: "false",
        complications: "",
        ultrasound_findings: "",
        fetal_heart_rate_bpm: "",
        placenta_position: "",
        presentation: "",
        gestational_age_weeks: "",
        notes: "",
      });
      return;
    }
    fetchCurrentPregnancy().then(data => {
      if (data) {
        reset({
          ...data,
          patient_id: patientId,
          visit_id: selectedVisitId,
        });
      }
    });
  }, [patientId, selectedVisitId, reset, fetchCurrentPregnancy]);

  return (
    <div className="w-full">
      {/* Premium Status Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className={`flex-1 flex items-center justify-between gap-4 px-5 py-3 rounded-2xl border transition-all duration-500 ease-in-out ${
          mode === "update" 
            ? "border-emerald-200 bg-emerald-50/20 text-emerald-800 shadow-sm shadow-emerald-900/5" 
            : "border-slate-200 bg-slate-50/40 text-slate-600 shadow-sm"
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative">
               <div className={`size-2.5 rounded-full ${mode === "update" ? "bg-emerald-500" : "bg-slate-300"}`}  />
               {mode === "update" && <div className="absolute inset-0 size-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-0.5">
                {mode === "update" ? "Live Pregnancy Link" : "Awaiting Initial Data"}
              </span>
              <span className="text-[11px] font-bold opacity-80 leading-none">
                {statusMessage}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-tighter ${
              mode === "update" 
                ? "bg-emerald-100/50 border-emerald-200 text-emerald-700" 
                : "bg-white border-slate-200 text-slate-500"
            }`}>
              {mode === "update" ? "Active Monitoring" : "Record Initialization"}
            </span>
          </div>
        </div>

        <div className="px-4 py-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center min-w-[100px] transition-all hover:border-slate-300">
           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session ID</span>
           <span className="text-[13px] font-black text-slate-900 tracking-tighter">#{selectedVisitId?.toString().slice(-4) || 'OPEN'}</span>
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
        <InputField
          label="Multiple Pregnancy"
          id="multiple_pregnancy"
          as="select"
          err={errors.multiple_pregnancy?.message}
          {...register("multiple_pregnancy")}
        >
          <option value="false">Single</option>
          <option value="true">Multiple (Twins/Triplets)</option>
        </InputField>

        <InputField
          label="Complications"
          placeholder="Specify if any"
          err={errors.complications?.message}
          {...register("complications")}
        />

        <InputField
          label="Ultrasound Findings"
          placeholder="Brief summary"
          err={errors.ultrasound_findings?.message}
          {...register("ultrasound_findings")}
        />

        <InputField
          label="Fetal Heart Rate (BPM)"
          placeholder="Ex: 140"
          err={errors.fetal_heart_rate_bpm?.message}
          {...register("fetal_heart_rate_bpm")}
        />

        <InputField
          label="Placenta Position"
          as="select"
          err={errors.placenta_position?.message}
          {...register("placenta_position")}
        >
          <option value="" hidden>Select position</option>
          <option value="Anterior">Anterior</option>
          <option value="Posterior">Posterior</option>
          <option value="Fundal">Fundal</option>
          <option value="Right Lateral">Right Lateral</option>
          <option value="Left Lateral">Left Lateral</option>
        </InputField>

        <InputField
          label="Presentation"
          placeholder="Ex: Cephalic"
          err={errors.presentation?.message}
          {...register("presentation")}
        />

        <InputField
          label="Gestational Age (Weeks)"
          placeholder="Ex: 12"
          err={errors.gestational_age_weeks?.message}
          {...register("gestational_age_weeks")}
        />

        <div className="md:col-span-2 lg:col-span-2">
          <InputField
            label="Additional Notes"
            as="textarea"
            placeholder="Detailed observations..."
            err={errors.notes?.message}
            {...register("notes")}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3 flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-2">
          <FormButton
            text="Reset"
            variant="ghost"
            onClick={() => reset()}
          />
          <FormButton
            text={mode === "update" ? "Update History" : "Save Record"}
            variant="primary"
            onClick={handleSubmit(mode === "update" ? updateInfo : addInfo)}
          />
        </div>
      </form>
    </div>
  );
}

function InputField({ label, id, err, as = "input", children, placeholder, autoComplete = "off", ...rest }: any) {
  const Component = as;
  return (
    <div className="space-y-1 group">
      <label htmlFor={id} className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">
        {label}
      </label>
      <div className="relative">
        <Component
          id={id}
          placeholder={placeholder}
          autoComplete={autoComplete}
          rows={as === "textarea" ? 2 : undefined}
          className={`w-full ${as === "textarea" ? "py-2.5 min-h-[80px]" : "h-10"} px-3 bg-slate-50/50 border rounded-xl text-xs font-bold transition-all outline-none resize-none
            ${err
              ? "border-red-200 bg-red-50 text-red-900 placeholder:text-red-300"
              : "border-slate-200 text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
            }`}
          {...rest}
        >
          {children}
        </Component>
      </div>
      {err && <p className="text-[9px] font-bold text-red-500 ml-1.5 mt-0.5">{err}</p>}
    </div>
  );
}

function FormButton({ text, onClick, variant = "primary" }: { text: string; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" }) {
  const styles = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/10",
    secondary: "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50",
    ghost: "bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 px-6 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${styles[variant]}`}
    >
      {text}
    </button>
  );
}
