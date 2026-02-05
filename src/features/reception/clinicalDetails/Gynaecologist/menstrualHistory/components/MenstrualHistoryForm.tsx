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

  const { fetchHistory, addInfo, updateInfo } = useMenstrualHistory(patientId, reset);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-emerald-200">
          🩸
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Menstrual History</h2>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Clinical Record Documentation</p>
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <InputField
          label="Menarch Age"
          placeholder="Enter age at first period"
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
          placeholder="Specify any previous contraception"
          err={errors.contraception_history?.message}
          {...register("contraception_history")}
        />
        <InputField
          label="Gynecologic Surgeries"
          placeholder="Specify any previous surgeries"
          err={errors.gynecologic_surgeries?.message}
          {...register("gynecologic_surgeries")}
        />
        <InputField
          label="Medical Conditions"
          placeholder="Any related medical issues"
          err={errors.medical_conditions?.message}
          {...register("medical_conditions")}
        />
        <InputField
          label="Menopause Status"
          as="select"
          err={errors.menopause_status?.message}
          {...register("menopause_status")}
        >
          <option value="" hidden>Select Menopause Status</option>
          <option value="true">Post-menopausal</option>
          <option value="false">Pre-menopausal</option>
        </InputField>

        <div className="md:col-span-2 flex items-center justify-end gap-4 pt-6 border-t border-slate-100 mt-4">
          <FormButton
            text="Reset Form"
            variant="ghost"
            onClick={() => reset()}
          />
          <FormButton
            text="Update Records"
            variant="secondary"
            onClick={handleSubmit(updateInfo)}
          />
          <FormButton
            text="Save history"
            variant="primary"
            onClick={handleSubmit(addInfo)}
          />
        </div>
      </form>
    </div>
  );
}

function InputField({ label, err, as = "input", children, placeholder, ...rest }: any) {
  const Component = as;
  return (
    <div className="space-y-1.5 group">
      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">
        {label}
      </label>
      <div className="relative">
        <Component
          placeholder={placeholder}
          className={`w-full h-12 px-4 bg-slate-50 border rounded-2xl text-sm font-bold transition-all outline-none
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
