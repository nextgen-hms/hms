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

  const { addInfo, updateInfo } = useObstetricHistory(patientId, reset);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-emerald-200">
          📋
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Obstetric History</h2>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Comprehensive Pregnancy Records</p>
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <InputField
          label="First Pregnancy?"
          id="isFirstPregnancy"
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
          label="Gravida (No. of Pregnancies)"
          placeholder="Ex: 2"
          err={errors.gravida?.message}
          {...register("gravida")}
        />

        <InputField
          label="Para (No. of Live Births)"
          placeholder="Ex: 1"
          err={errors.para?.message}
          {...register("para")}
        />

        <InputField
          label="Last Menstrual Period (LMP)"
          type="date"
          err={errors.last_menstrual_cycle?.message}
          {...register("last_menstrual_cycle")}
        />

        <InputField
          label="Abortions / Miscarriages"
          placeholder="Ex: 0"
          err={errors.abortions?.message}
          {...register("abortions")}
        />

        <InputField
          label="Estimated Delivery Date (EDD)"
          type="date"
          err={errors.edd?.message}
          {...register("edd")}
        />

        <div className="md:col-span-2">
          <InputField
            label="Additional Notes"
            as="textarea"
            placeholder="Relevant medical history details..."
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
            text="Update Records"
            variant="secondary"
            onClick={handleSubmit(updateInfo)}
          />
          <FormButton
            text="Save History"
            variant="primary"
            onClick={handleSubmit(addInfo)}
          />
        </div>
      </form>
    </div>
  );
}

function InputField({ label, id, err, as = "input", children, placeholder, ...rest }: any) {
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
