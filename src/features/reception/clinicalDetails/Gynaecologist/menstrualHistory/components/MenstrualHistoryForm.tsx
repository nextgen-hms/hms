"use client";
import { usePatient } from "@/contexts/PatientIdContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MenstrualHistorySchema, MenstrualHistoryFormData } from "../types";
import { useMenstrualHistory } from "../hooks/useMenstrualHistory";

export default function MenstrualHistoryForm() {
  const { patientId } = usePatient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MenstrualHistoryFormData>({
    resolver: zodResolver(MenstrualHistorySchema),
    mode: "onChange",
  });

  const { addInfo, updateInfo, hasRecord, statusMessage } = useMenstrualHistory(patientId, reset);

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
              {hasRecord ? "Data Synchronization Active" : "Fresh Entry Pipeline"}
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
            {hasRecord ? "Update Clinical Record" : "New Patient Profile"}
          </span>
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
        <InputField
          label="Menarch Age"
          placeholder="Ex: 12"
          err={errors.menarch_age?.message}
          {...register("menarch_age")}
        />
        <InputField
          label="Cycle Length (Days)"
          type="number"
          placeholder="Ex: 28"
          err={errors.cycle_length_days?.message}
          {...register("cycle_length_days")}
        />
        <InputField
          label="Bleeding Duration (Days)"
          type="number"
          placeholder="Ex: 5"
          err={errors.bleeding_days?.message}
          {...register("bleeding_days")}
        />
        <InputField
          label="Menstrual Regularity"
          as="select"
          err={errors.menstrual_regular?.message}
          {...register("menstrual_regular")}
        >
          <option value="" hidden>Select Regularity</option>
          <option value="true">Regular</option>
          <option value="false">Irregular</option>
        </InputField>
        <InputField
          label="Contraception History"
          placeholder="Specify if any"
          err={errors.contraception_history?.message}
          {...register("contraception_history")}
        />
        <InputField
          label="Gynecologic Surgeries"
          placeholder="Specify if any"
          err={errors.gynecologic_surgeries?.message}
          {...register("gynecologic_surgeries")}
        />
        <InputField
          label="Medical Conditions"
          placeholder="Specify if any"
          err={errors.medical_conditions?.message}
          {...register("medical_conditions")}
        />
        <InputField
          label="Menopause Status"
          as="select"
          err={errors.menopause_status?.message}
          {...register("menopause_status")}
        >
          <option value="" hidden>Select status</option>
          <option value="true">Post-menopausal</option>
          <option value="false">Pre-menopausal</option>
        </InputField>

        <div className="md:col-span-2 lg:col-span-3 flex items-center justify-end gap-3 pt-8 border-t border-slate-100 mt-4">
          <FormButton
            text="Clear Form"
            variant="ghost"
            onClick={() => reset()}
          />
          <FormButton
            text={hasRecord ? "Update Clinical Record" : "Save Clinical Record"}
            variant="primary"
            onClick={handleSubmit(hasRecord ? updateInfo : addInfo)}
          />
        </div>
      </form>
    </div>
  );
}

function InputField({ label, err, as = "input", children, placeholder, autoComplete = "off", ...rest }: any) {
  const Component = as;
  return (
    <div className="space-y-1.5 group">
      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">
        {label}
      </label>
      <div className="relative">
        <Component
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full h-10 px-4 bg-slate-50/50 border rounded-xl text-xs font-bold transition-all outline-none
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
      className={`h-10 px-8 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${styles[variant]}`}
    >
      {text}
    </button>
  );
}
