"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CurrentPregnancySchema, CurrentPregnancyFormData } from "../types";
import { useCurrentPregnancy } from "../hooks/useCurrentPregnancy";
import { useEffect } from "react";
import { usePatient } from "@/contexts/PatientIdContext"; // <-- use context

export default function CurrentPregnancyForm() {
  const { patientId } = usePatient(); // get patientId from context

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CurrentPregnancyFormData>({
    resolver: zodResolver(CurrentPregnancySchema),
    mode: "onChange",
  });

  const { visitId, fetchCurrentPregnancy, addInfo, updateInfo } = useCurrentPregnancy(patientId);

  // Load existing data
  useEffect(() => {
    if (!patientId) return;
    fetchCurrentPregnancy().then(data => reset(data));
  }, [patientId, reset, fetchCurrentPregnancy]);

  return (
    <form className="w-2/3 grid grid-cols-2 gap-4 p-4 border-black/40">
      <div className="col-span-2">
        <h1 className="text-2xl pl-2 font-semibold text-black/70">Current Pregnancy</h1>
        <p>Visit Id: {visitId}</p>
      </div>

      <InputField label="Multiple Pregnancy" id="multiple_pregnancy" as="select" {...register("multiple_pregnancy")}>
        <option value="true">True</option>
        <option value="false">False</option>
      </InputField>

      <InputField label="Complications" id="complications" {...register("complications")} />
      <InputField label="Ultrasound Findings" id="ultrasound_findings" {...register("ultrasound_findings")} />
      <InputField label="Fetal Heart Rate" id="fetal_heart_rate_bpm" {...register("fetal_heart_rate_bpm")} />

      <InputField label="Placenta Position" id="placenta_position" as="select" {...register("placenta_position")}>
        <option value="" hidden>Select Placenta Position</option>
        <option value="Right">Right</option>
        <option value="Left">Left</option>
      </InputField>

      <InputField label="Presentation" id="presentation" {...register("presentation")} />
      <InputField label="Gestational Age Weeks" id="gestational_age_weeks" {...register("gestational_age_weeks")} />
      <InputField label="Notes" id="notes" as="textarea" {...register("notes")} />

      <div className="flex space-x-6 col-span-2 pt-2">
        <FormButton text="Add Info" onClick={handleSubmit(addInfo)} />
        <FormButton text="Update Info" onClick={handleSubmit(updateInfo)} />
        <FormButton text="Reset Info" onClick={() => reset()} />
      </div>
    </form>
  );
}

// --- Reusable components inside the same file ---
function InputField({ label, id, err, as = "input", children, ...rest }: any) {
  const Component = as;
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="px-2 pb-1 text-sm text-black/70">{label}:</label>
      <Component id={id} className="w-[80%] p-2 bg-gray-200 rounded-2xl" {...rest}>
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
