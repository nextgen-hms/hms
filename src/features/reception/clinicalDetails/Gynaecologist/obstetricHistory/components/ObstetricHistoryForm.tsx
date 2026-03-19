"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ObstetricHistorySchema, ObstetricHistoryFormData } from "../types";
import { useObstetricHistory } from "../hooks/useObstetricHistory";
import { usePatient } from "@/contexts/PatientIdContext";

export default function ObstetricHistoryForm() {
  const { patientId } = usePatient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ObstetricHistoryFormData>({
    resolver: zodResolver(ObstetricHistorySchema),
    mode: "onChange",
  });

  const { addInfo, updateInfo, hasRecord, statusMessage } = useObstetricHistory(patientId, reset);

  return (
    <div className="w-full">
      {/* Premium Status Header */}
      <div className={`mb-6 flex items-center justify-between gap-4 px-5 py-3 rounded-2xl border transition-all duration-500 ease-in-out ${
        hasRecord 
          ? "border-emerald-200 bg-emerald-50/20 text-emerald-800 shadow-sm shadow-emerald-900/5" 
          : "border-slate-200 bg-slate-50/40 text-slate-600 shadow-sm"
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className={`size-2.5 rounded-full ${hasRecord ? "bg-emerald-500" : "bg-slate-300"}`}  />
             {hasRecord && <div className="absolute inset-0 size-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-0.5">
              {hasRecord ? "Obstetric Ledger Active" : "New History Pipeline"}
            </span>
            <span className="text-[11px] font-bold opacity-80 leading-none">
              {statusMessage}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-tighter ${
            hasRecord 
              ? "bg-emerald-100/50 border-emerald-200 text-emerald-700" 
              : "bg-white border-slate-200 text-slate-500"
          }`}>
            {hasRecord ? "Sync Mode" : "Initial Entry"}
          </span>
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
        <InputField
          label="First Pregnancy?"
          id="is_first_pregnancy"
          as="select"
          err={errors.is_first_pregnancy?.message}
          {...register("is_first_pregnancy")}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </InputField>

        <InputField
          label="Years Married"
          placeholder="Ex: 5"
          err={errors.married_years?.message}
          {...register("married_years")}
        />

        <InputField
          label="Gravida (Pregnancies)"
          placeholder="Ex: 2"
          err={errors.gravida?.message}
          {...register("gravida")}
        />

        <InputField
          label="Para (Live Births)"
          placeholder="Ex: 1"
          err={errors.para?.message}
          {...register("para")}
        />

        <InputField
          label="LMP"
          type="date"
          err={errors.last_menstrual_cycle?.message}
          {...register("last_menstrual_cycle")}
        />

        <InputField
          label="Abortions"
          placeholder="Ex: 0"
          err={errors.abortions?.message}
          {...register("abortions")}
        />

        <InputField
          label="EDD"
          type="date"
          err={errors.edd?.message}
          {...register("edd")}
        />

        <div className="md:col-span-2 lg:col-span-2">
          <InputField
            label="Additional Notes"
            as="textarea"
            placeholder="Relevant medical history details..."
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
            text={hasRecord ? "Update History" : "Save Record"}
            variant="primary"
            onClick={handleSubmit(hasRecord ? updateInfo : addInfo)}
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
