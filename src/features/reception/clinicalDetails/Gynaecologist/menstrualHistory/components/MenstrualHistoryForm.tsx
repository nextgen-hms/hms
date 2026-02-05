"use client";
import { usePatient } from "@/contexts/PatientIdContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MenstrualHistorySchema, MenstrualHistoryFormData } from "../types";
import { useMenstrualHistory } from "../hooks/useMenstrualHistory";

export default function MenstrualHistoryForm() {
  const { patientId } = usePatient(); // from context
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MenstrualHistoryFormData>({
    resolver: zodResolver(MenstrualHistorySchema),
    mode: "onChange",
  });

  const { fetchHistory, addInfo, updateInfo } = useMenstrualHistory(patientId, reset);

  return (
    <form>
      <div className="w-2/3 grid grid-cols-2 gap-4 p-4 border-black/40 space-y-5">
        <div className="col-span-2">
          <h1 className="text-2xl pl-2 font-semibold text-black/70 rounded-2xl border-black/30 w-[60%]">
            Menstrual History
          </h1>
        </div>

        <InputField label="Menarch Age" {...register("menarch_age")} />
        <InputField label="Cycle Length Days" type="number" {...register("cycle_length_days")} />
        <InputField label="Bleeding Duration Days" type="number" {...register("bleeding_days")} />
        <InputField label="Menstrual Regular" as="select" {...register("menstrual_regular")}>
          <option value="" hidden>Select True or False</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </InputField>
        <InputField label="Contraception History" {...register("contraception_history")} />
        <InputField label="Gynecologic Surgeries" {...register("gynecologic_surgeries")} />
        <InputField label="Medical Conditions" {...register("medical_conditions")} />
        <InputField label="Menopause Status" as="select" {...register("menopause_status")}>
          <option value="" hidden>Select status</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </InputField>

        <div className="flex space-x-6 col-span-2 pt-2">
          <FormButton text="Add Info" onClick={handleSubmit(addInfo)} />
          <FormButton text="Update Info" onClick={handleSubmit(updateInfo)} />
          <FormButton text="Reset Info" onClick={() => reset()} />
        </div>
      </div>
    </form>
  );
}

// --- Reusable components inside same file ---
function InputField({ label, err, as = "input", children, ...rest }: any) {
  const Component = as;
  return (
    <div className="flex flex-col">
      <label className="px-2 pb-1 text-sm text-black/70">{label}:</label>
      <Component className="w-[80%] p-2 bg-gray-200 rounded-2xl" {...rest}>
        {children}
      </Component>
      {err && <p className="text-red-300 text-sm px-2">{err}</p>}
    </div>
  );
}

function FormButton({ text, onClick }: { text: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-gradient-to-r w-[20%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
    >
      {text}
    </button>
  );
}
