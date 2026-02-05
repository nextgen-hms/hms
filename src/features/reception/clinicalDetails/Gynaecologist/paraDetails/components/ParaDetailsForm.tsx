"use client";

import { useFieldArray } from "react-hook-form";
import { useParaDetails } from "../hooks/useParaDetails";

export default function ParaDetailsForm() {
  const { methods, control, addPara, updateParaData, obstetricHistoryId } = useParaDetails();
  const { register, handleSubmit, reset } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: "para" });

  const addNewPara = () => {
    append({
      obstetric_history_id: obstetricHistoryId || "",
      para_number: fields.length + 1,
      birth_year: "",
      birth_month: "",
      gender: "Male",
      delivery_type: "Normal",
      alive: "true",
      birth_weight_grams: "",
      complications: "",
      notes: "",
      gestational_age_weeks: "",
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-emerald-200">
            🔢
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Para Details</h2>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Childbirth History Records</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">Obstetric History ID</span>
            <span className="text-sm font-bold text-slate-700">#{obstetricHistoryId || 'New'}</span>
          </div>
          <button
            type="button"
            onClick={addNewPara}
            className="h-11 px-6 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <span>➕</span> Add Record
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0  overflow-y-auto custom-scrollbar pr-2 space-y-8 pb-32">
        {fields.map((field, index) => (
          <div key={field.id} className="relative bg-white/50 backdrop-blur-sm border border-slate-200 rounded-[2rem] p-8 shadow-sm group hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-700 flex items-center gap-3">
                <span className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-black text-slate-500">
                  {index + 1}
                </span>
                Para Record Details
              </h3>
              <button
                type="button"
                onClick={() => remove(index)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
              >
                🗑️
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField
                label="Birth Year"
                placeholder="Ex: 2020"
                {...register(`para.${index}.birth_year`)}
              />
              <InputField
                label="Birth Month"
                placeholder="Ex: June"
                {...register(`para.${index}.birth_month`)}
              />
              <InputField
                label="Gender"
                as="select"
                {...register(`para.${index}.gender`)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </InputField>
              <InputField
                label="Delivery Type"
                as="select"
                {...register(`para.${index}.delivery_type`)}
              >
                <option value="Normal">Normal</option>
                <option value="C-Section">C-Section</option>
                <option value="AssistedVD">Assisted Vd</option>
              </InputField>
              <InputField
                label="Is Child Alive?"
                as="select"
                {...register(`para.${index}.alive`)}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </InputField>
              <InputField
                label="Birth Weight (Grams)"
                placeholder="Ex: 3200"
                {...register(`para.${index}.birth_weight_grams`)}
              />
              <InputField
                label="Gestational Age (Weeks)"
                placeholder="Ex: 38"
                {...register(`para.${index}.gestational_age_weeks`)}
              />
              <div className="md:col-span-2">
                <InputField
                  label="Complications"
                  placeholder="Specify any birth complications..."
                  {...register(`para.${index}.complications`)}
                />
              </div>
              <div className="md:col-span-3 lg:col-span-3">
                <InputField
                  label="Notes"
                  as="textarea"
                  placeholder="General history notes, congenital issues, etc..."
                  {...register(`para.${index}.notes`)}
                />
              </div>
            </div>
            <input {...register(`para.${index}.para_number`)} defaultValue={index + 1} type="hidden" />
          </div>
        ))}

        {fields.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] opacity-40">
            <span className="text-6xl mb-4">📭</span>
            <p className="text-lg font-black text-slate-400 uppercase tracking-tighter">No Para records added yet</p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 flex items-center justify-end gap-4 z-10">
        <FormButton
          text="Submit All"
          variant="primary"
          onClick={handleSubmit(addPara)}
        />
        <FormButton
          text="Update Information"
          variant="secondary"
          onClick={handleSubmit(updateParaData)}
        />
      </div>
    </div>
  );
}

function InputField({ label, err, as = "input", children, placeholder, ...rest }: any) {
  const Component = as;
  return (
    <div className="space-y-1 group">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">
        {label}
      </label>
      <div className="relative">
        <Component
          placeholder={placeholder}
          rows={as === "textarea" ? 2 : undefined}
          className={`w-full ${as === "textarea" ? "py-3 min-h-[80px]" : "h-11"} px-4 bg-slate-50 border rounded-xl text-xs font-bold transition-all outline-none resize-none
            ${err
              ? "border-red-200 bg-red-50 text-red-900 placeholder:text-red-300"
              : "border-slate-200 text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
            }`}
          {...rest}
        >
          {children}
        </Component>
      </div>
      {err && <p className="text-[9px] font-bold text-red-500 ml-2">{err}</p>}
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
      className={`h-11 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-lg active:scale-95 ${styles[variant]}`}
    >
      {text}
    </button>
  );
}
