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
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-emerald-200">
            🤰
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Current Pregnancy</h2>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Active Pregnancy Documentation</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Visit Reference</span>
          <span className="text-sm font-bold text-slate-700">#{selectedVisitId || '---'}</span>
        </div>
      </div>

      <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${mode === "update" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
        <div className="flex items-center justify-between gap-3">
          <span>{statusMessage}</span>
          <span className="shrink-0 rounded-xl bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
            {mode === "update" ? "Update Mode" : "Create Mode"}
          </span>
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
          placeholder="Specify if any..."
          err={errors.complications?.message}
          {...register("complications")}
        />

        <InputField
          label="Ultrasound Findings"
          placeholder="Brief summary of findings"
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

        <div className="md:col-span-2">
          <InputField
            label="Additional Notes"
            as="textarea"
            placeholder="Detailed observations..."
            err={errors.notes?.message}
            {...register("notes")}
          />
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-4 pt-6 border-t border-slate-100 mt-4">
          <FormButton
            text="Reset"
            variant="ghost"
            onClick={() => reset()}
          />
          <FormButton
            text={mode === "update" ? "Update Record" : "Save Record"}
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
    <div className="space-y-1.5 group">
      <label htmlFor={id} className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">
        {label}
      </label>
      <div className="relative">
        <Component
          id={id}
          placeholder={placeholder}
          autoComplete={autoComplete}
          rows={as === "textarea" ? 3 : undefined}
          className={`w-full ${as === "textarea" ? "py-3 min-h-[100px]" : "h-12"} px-4 bg-slate-50 border rounded-2xl text-sm font-bold transition-all outline-none resize-none
            ${err
              ? "border-red-200 bg-red-50 text-red-900 placeholder:text-red-300"
              : "border-slate-200 text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
            }`}
          {...rest}
        >
          {children}
        </Component>
      </div>
      {err && <p className="text-[10px] font-bold text-red-500 ml-2 animate-in fade-in slide-in-from-top-1">{err}</p>}
    </div>
  );
}

function FormButton({ text, onClick, variant = "primary" }: { text: string; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" }) {
  const styles = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200",
    secondary: "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 shadow-emerald-200/50",
    ghost: "bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 px-8 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg active:scale-95 ${styles[variant]}`}
    >
      {text}
    </button>
  );
}
