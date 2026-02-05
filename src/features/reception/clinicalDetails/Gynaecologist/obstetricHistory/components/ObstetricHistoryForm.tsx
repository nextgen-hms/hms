"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ObstetricHistorySchema, ObstetricHistoryFormData } from "../types";
import { useObstetricHistory } from "../hooks/useObstetricHistory";
import { usePatient } from "@/contexts/PatientIdContext";
export default function ObstetricHistoryForm() {
  // get patientId from context or props
  const {patientId} = usePatient(); // <-- your context hook

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ObstetricHistoryFormData>({
    resolver: zodResolver(ObstetricHistorySchema),
    mode: "onChange",
  });

  const { addInfo, updateInfo } = useObstetricHistory(patientId, reset);

  return (
    <form className="w-2/3 grid grid-cols-2 gap-4 p-4 border-black/40">
      <div className="col-span-2">
        <h1 className="text-2xl pl-2 font-semibold text-black/70">Obstetric History</h1>
      </div>

      <InputField label="Is First Pregnancy" id="isFirstPregnancy" as="select" {...register("is_first_pregnancy")}>
        <option value="true">True</option>
        <option value="false">False</option>
      </InputField>

      <InputField label="Married Years" id="marriedYears" {...register("married_years")} />
      <InputField label="Gravida" id="gravida" {...register("gravida")} />
      <InputField label="Para" id="para" {...register("para")} />
      <InputField label="Last Menstrual Cycle" id="lastMenstrualCycle" as="input" type="date" {...register("last_menstrual_cycle")} />
      <InputField label="Abortions" id="abortions" {...register("abortions")} />
      <InputField label="EDD" id="edd" as="input" type="date" {...register("edd")} />
      <InputField label="Notes" id="notes" as="textarea" {...register("notes")} />

      <div className="flex space-x-6 col-span-2 pt-2">
        <FormButton text="Add Info" onClick={handleSubmit(addInfo)} />
        <FormButton text="Update Info" onClick={handleSubmit(updateInfo)} />
        <FormButton text="Reset Info" onClick={() => reset()} />
      </div>
    </form>
  );
}

// --- Reusable components ---
function InputField({ label, id, as = "input", children, ...rest }: any) {
  const Component = as;
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="px-2 pb-1 text-sm text-black/70">{label}:</label>
      <Component id={id} className="w-[80%] p-2 bg-gray-200 rounded-2xl" {...rest}>{children}</Component>
    </div>
  );
}

function FormButton({ text, onClick }: { text: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="bg-gradient-to-r w-[20%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl">
      {text}
    </button>
  );
}
