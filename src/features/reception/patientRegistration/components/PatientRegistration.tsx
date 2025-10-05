"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, PatientFormData } from "../types";
import { usePatientRegistration } from "../hooks/usePatientRegistration";

export default function PatientRegistrationForm() {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const { pId, setpId, setPatientId, getPatientInfo, addPatient, updateInfo } = usePatientRegistration();

  return (
    <form className="w-2/3 grid grid-cols-2 gap-4 p-4 border-black/40 rounded-3xl">
      {/* Patient ID */}
      <div className="flex flex-col col-span-2">
        <label htmlFor="patientId" className="text-sm px-2 pb-1 text-black/70">Patient Id:</label>
        <Controller
          name="patient_id"
          control={control}
          render={({ field }) => (
            <input
              type="text"
              placeholder="Enter existing Patient Id"
              className="w-[40%] p-2 bg-gray-200 rounded-2xl"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => {
                field.onChange(e);
                setpId(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setPatientId(pId);
                  getPatientInfo().then(data => reset(data));
                }
              }}
            />
          )}
        />
        <ErrorMsg msg={errors.patient_id?.message} />
      </div>

      {/* Other Inputs */}
      <InputField label="Patient Name" id="pname" {...register("patient_name")} err={errors.patient_name?.message} />
      <InputField label="Age" id="age" type="number" {...register("age")} err={errors.age?.message} />
      <InputField label="Gender" id="gender" as="select" {...register("gender")} err={errors.gender?.message}>
        <option value="" hidden>Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </InputField>
      <InputField label="CNIC" id="cnic" {...register("cnic")} err={errors.cnic?.message} />
      <InputField label="Contact Number" id="contact" {...register("contact_number")} err={errors.contact_number?.message} />
      <InputField label="Address" id="address" as="textarea" {...register("address")} err={errors.address?.message} />

      {/* Buttons */}
      <div className="flex space-x-6 col-span-2 pt-4">
        <FormButton text="Add Patient" onClick={handleSubmit(addPatient)} />
        <FormButton text="Update Info" onClick={handleSubmit(updateInfo)} />
        <FormButton text="Reset Info" onClick={() => reset()} />
      </div>
    </form>
  );
}

// --- Reusable Components inside the same file ---

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

function ErrorMsg({ msg }: { msg?: string }) {
  return <div className="min-h-[20px]">{msg && <p className="text-red-300 text-sm px-2">{msg}</p>}</div>;
}
