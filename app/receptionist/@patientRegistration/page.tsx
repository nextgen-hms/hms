"use client";

import { usePatient } from "@/contexts/PatientIdContext";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Select from "react-select";


const patientSchema=z.object({
  patient_id: z.string().min(1,"Patient Id is required"),
  patient_name: z.string().min(3,"Name cannot be too short"),
  age: z.string().min(1,"age is Required"),
  gender: z.string().min(3,"Select Gender"),
  cnic: z.string().regex(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/,"Invalid Cnic"),
  contact_number: z.string().optional(),
  address: z.string().optional(),
})
type registerFormData =z.infer<typeof patientSchema>;


export default function PatientRegistration() {
  const [pId, setpId] = useState<string>("");
  const { patientId, setPatientId } = usePatient();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<registerFormData>({
  resolver:zodResolver(patientSchema)
  });
  async function getPatientInfo() {
    const res = await fetch(`api/patient/${pId}`);
    const data = await res.json();
    console.log(data);
    reset(data);
  }

  async function UpdateInfo(data: registerFormData) {
    const res = await fetch("api/patient", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    console.log(await res.json());
       if (res.ok) {
      const newPid = (await res.json()).patient_id;
      toast.success(`Patient Info Uppdated! ID: ${newPid}`);
      setpId(newPid);
    } else {
      toast.error("Failed to Update patient Info");
    }
  }
  async function addPatient(data: registerFormData) {
    const res = await fetch("api/patient", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const newPid = (await res.json()).patient_id;
      toast.success(`Patient Added! ID: ${newPid}`);
      setpId(newPid);
    } else {
      toast.error("failed to add patient");
    }
  }

  return (
    <form >
      <div className="w-2/3  border-black/40 grid grid-cols-2 rounded-3xl p-4 space-y-2">
        <div className="flex flex-col col-span-2  ">
          <label
            htmlFor="patientId"
            className="text-sm px-2 pb-1 text-black/70"
          >
            Patient Id :
          </label>

          <Controller
            name="patient_id"
            control={control}
            render={({ field }) => (
              <input
                className="bg-gray-200 rounded-2xl  w-[40%] p-2  "
                type="text"
                placeholder="Enter existing Patient Id"
                {...field}
                value={field.value ?? ""}
                onChange={(e) => {
                  field.onChange(e);
                  setpId(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPatientId(pId);
                    getPatientInfo();
                    e.preventDefault();
                  }
                }}
              />
            )}
          />
          <div className="min-h-[20px]">

         {errors.patient_id && (<p className="text-red-300 text-sm px-2 ">{errors.patient_id.message}</p>)}
          </div>
        </div>
        <div className="flex flex-col ">
          <label htmlFor="pname" className="px-2 pb-1 text-sm text-black/70 ">
            Patient Name:
          </label>
          <input
            id="pname"
            {...register("patient_name")}
            type="text"
            placeholder="Enter Patient Name "
            className="w-[80%] p-2 bg-gray-200 rounded-2xl "
          />
          <div className="min-h-[20px]">
            {errors.patient_name && (<p className="text-red-300 text-sm px-2">{errors.patient_name.message}</p>)}
          </div>
        </div>
        <div className="flex  ">
          <div className="flex flex-col w-[40%]">
            <label htmlFor="age" className="px-2 pb-1 text-sm text-black/70 ">
              Patient Age:
            </label>
            <input
              id="age"
              {...register("age")}
              type="number"
              placeholder="Enter Age"
              className="w-[80%] p-2 bg-gray-200  rounded-2xl "
            />
            <div className="min-h-[20px]">
            {errors.age && (<p className="text-red-300 text-sm px-2">{errors.age.message}</p>)}
          </div>
          </div>
          <div className="flex flex-col w-[50%]">
            <label htmlFor="gender" className="text-sm px-2 pb-1 text-black/70">
              Gender :
            </label>
            <select
              id="gender"
              className="bg-black/10 w-[80%] p-2  rounded-2xl outline-none text-black "
              required
              {...register("gender")}
            >
              <option value="" hidden>
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
               <div className="min-h-[20px]">
            {errors.gender && (<p className="text-red-300 text-sm px-2">{errors.gender.message}</p>)}
          </div>
          </div>
        </div>

        <div className="flex flex-col ">
          <label htmlFor="contact" className="px-2 pb-1 text-sm text-black/70 ">
            Patient Contact:
          </label>
          <input
            id="contact"
            {...register("contact_number")}
            type="text"
            placeholder="Enter Patient Contact"
            className="w-[80%] p-2 bg-gray-200 rounded-2xl "
          />
             <div className="min-h-[20px]">
            {errors.contact_number && (<p className="text-red-300 text-sm px-2">{errors.contact_number.message}</p>)}
          </div>
        </div>
        <div className="flex flex-col ">
          <label htmlFor="cnic" className="px-2 pb-1 text-sm text-black/70 ">
            Patient CNIC:
          </label>
          <input
            id="cnic"
            {...register("cnic")}
            type="text"
            placeholder="Enter CNIC (e.g. 42101-1234567-1)"
            className={`w-[80%] p-2 rounded-2xl outline-none bg-gray-200`}
          />
             <div className="min-h-[20px]">
            {errors.cnic && (<p className="text-red-300 text-sm px-2">{errors.cnic.message}</p>)}
          </div>
        </div>
        <div className="flex flex-col ">
          <label htmlFor="address" className="px-2 pb-1 text-sm text-black/70 ">
            Patient Address:
          </label>
          <textarea
            id="address"
            {...register("address")}
            placeholder="Enter  Patient Address"
            className="w-[80%] p-2 bg-gray-200 rounded-2xl "
          />
             <div className="min-h-[20px]">
            {errors.address && (<p className="text-red-300 text-sm px-2">{errors.address.message}</p>)}
          </div>
        </div>
        <div className="flex space-x-6 col-span-2 pt-6">
          <button
            className="bg-gradient-to-r w-[20%] p-2  from-[#BBF6AB] to-[#36F5D4] shadow-2xl  rounded-2xl"
            onClick={handleSubmit(addPatient)}
            type="button"
          >
            Add Patient
          </button>
          <button
            className="bg-gradient-to-r w-[20%] p-2  from-[#BBF6AB] to-[#36F5D4] shadow-2xl  rounded-2xl"
            onClick={handleSubmit(UpdateInfo)}
          >
            Update Info
          </button>
          <button
            className="bg-gradient-to-r w-[20%] p-2  from-[#BBF6AB] to-[#36F5D4] shadow-2xl  rounded-2xl"
            type="button"
            onClick={() => {
              reset({
                patient_id: "",
                patient_name: "",
                age: "",
                gender: "",
                cnic: "",
                contact_number: "",
                address: "",
              });
            }}
          >
            Reset Info
          </button>
        </div>
      </div>
    </form>
  );
}
