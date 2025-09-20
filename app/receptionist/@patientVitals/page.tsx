"use client";

import { usePatient } from "@/contexts/PatientIdContext";
import { useEffect, useState } from "react";
import { Controller,useForm } from "react-hook-form";
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
const PatientVitalsSchema=z.object({
      patient_id:z.string().min(1,"Patient Id is required"),
      blood_pressure:z.string().min(1,"Patient bp is required"),
      heart_rate:z.string(),
      temperature:z.string(),
      weight:z.string(),
      height:z.string(),
      blood_group:z.string()
});
type PatientVitalsForm = z.infer<typeof PatientVitalsSchema>
export default function PatientVitals() {
  const [pId, setpId] = useState<string>("");
  const { patientId, setPatientId } = usePatient();
  const {
      register,
      handleSubmit,
      formState:{errors},
      reset,
      control
  }=useForm<PatientVitalsForm>({
    resolver:zodResolver(PatientVitalsSchema)
  })
  useEffect(() => {
    if (!patientId) return;
   setpId(patientId);
    getPatientInfo();
    
  }, [patientId]);

  async function getPatientInfo() {
    reset({
      blood_group:"",
      blood_pressure:"",
      temperature:"",
      heart_rate:"",
      height:"",
      weight:"",
      patient_id:patientId||"",
    })
    try{
 const res = await fetch(`api/patientVitals/${patientId}`);
    const data = await res.json();
    console.log(data);
    if (!res.ok) {
      toast.error(` ${JSON.stringify(data.error)}`);
      return;
    }
    toast.success("found patient vitals")
    reset({
      ...data,
      patient_id:patientId,
    })
    }catch(err){

      toast.error("failed to fetch patient vitals");
      console.error(err);
    }
   
    
  }
  
  async function UpdateInfo(data:PatientVitalsForm) {
    console.log(data);
    const res = await fetch("api/patientVitals", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const res_data=await res.json();
     if(res.ok){
      toast.success("patient vitals are updated");
     }
     else{
      toast.error(`failed to update patient vitals ${JSON.stringify(res_data)}`)
     }
    
  }
  async function addPatient(data:PatientVitalsForm) {
    console.log(data);
    const res = await fetch("api/patientVitals", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const res_data=await res.json();
    console.log(res_data);
    
     if(res.ok){
      toast.success("patient vitals are added");
     }
     else{
      toast.error(`failed to add patient vitals ${JSON.stringify(res_data.detail.detail)}`)
     }
  }
  return (
    <form >
    <div className="w-2/3  border-black/40 grid grid-cols-2  p-4 ">
      <div className="flex flex-col col-span-2  ">
         <label  htmlFor="pid" className="px-2 pb-1 text-sm text-black/70 ">Patient Id:</label>
         <Controller
           name="patient_id"
           control={control}
           render={({field})=>
           <input id="pid" 
           {...field}
           value={field.value || ""}
           type="text"
            placeholder="Enter existing Patient Id" 
            className=" w-[40%] p-2  bg-gray-200 rounded-2xl "
            onChange={(e)=>{
              field.onChange(e.target.value);
                setpId(e.target.value);
              }}
            onKeyDown={(e)=>{
                if(e.key === "Enter"){
                    setPatientId(pId);   
                    e.preventDefault();
                }}}
              />
          }
         />
           <div className="min-h-[20px]">

         {errors.patient_id && (<p className="text-red-300 text-sm px-2 ">{errors.patient_id.message}</p>)}
          </div>
     
      </div>
       <div className="flex flex-col ">
         <label  htmlFor="bgp" className="px-2 pb-1 text-sm text-black/70 ">Blood Pressure:</label>
      <input id="bgp" type="text" placeholder="Enter Blood Pressure "
              className="w-[80%] p-2  bg-gray-200 rounded-2xl "
               {...register("blood_pressure")}
       />
        <div className="min-h-[20px]">

         {errors.blood_pressure && (<p className="text-red-300 text-sm px-2 ">{errors.blood_pressure.message}</p>)}
          </div>
      </div>
      
         <div className="flex flex-col ">
         <label  htmlFor="temp" className="px-2 pb-1 text-sm text-black/70 ">Temperatuure:</label>
      <input id="temp"  type="text" placeholder="Enter Temperature"
             className="w-[80%] p-2 bg-gray-200  rounded-2xl "
             {...register("temperature")}
             />
               <div className="min-h-[20px]">

         {errors.blood_pressure && (<p className="text-red-300 text-sm px-2 ">{errors.blood_pressure.message}</p>)}
          </div>
      </div>
      <div className="flex flex-col ">
         <label  htmlFor="heart_rate" className="px-2 pb-1 text-sm text-black/70 ">Heart Rate:</label>
      <input id="heart_rate"  type="text" placeholder="Enter Heart Rate"
             className="w-[80%] p-2 bg-gray-200  rounded-2xl "
             {...register("heart_rate")}
             />
               <div className="min-h-[20px]">

         {errors.blood_pressure && (<p className="text-red-300 text-sm px-2 ">{errors.blood_pressure.message}</p>)}
          </div>
      </div>
      
      
      <div className="flex flex-col ">
         <label  htmlFor="height" className="px-2 pb-1 text-sm text-black/70 ">Height:</label>
      <input id="height"  type="text" placeholder="Enter Height"
             className="w-[80%] p-2 bg-gray-200 rounded-2xl "
             {...register("height")}
             />
               <div className="min-h-[20px]">

         {errors.blood_pressure && (<p className="text-red-300 text-sm px-2 ">{errors.blood_pressure.message}</p>)}
          </div>
      </div>
      <div className="flex flex-col ">
         <label  htmlFor="weight" className="px-2 pb-1 text-sm text-black/70 ">Weight:</label>
      <input id="weight"  type="text" placeholder="Weight"
             className="w-[80%] p-2  bg-gray-200 rounded-3xl "
            {...register("weight")}
            />
      </div>
         <div className="flex flex-col ">
         <label  htmlFor="blood_group" className="px-2 pb-1 text-sm text-black/70 ">Blood Group:</label>
        <select 
        className="w-[80%] p-2 bg-gray-200  rounded-2xl "
        {...register("blood_group")}
        >
          <option value="" hidden>Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="B+">B+</option>
          <option value="AB+">AB+</option>
          <option value="A-">A-</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
      </div>
      <div className="flex space-x-6 col-span-2 pt-6">
        <button className="bg-gradient-to-r w-[20%] p-2  from-[#BBF6AB] to-[#36F5D4] shadow-2xl  rounded-2xl"
                onClick={handleSubmit(addPatient)}
                type="button"
        >Add Vitals</button>
      <button className="bg-gradient-to-r w-[20%] p-2  from-[#BBF6AB] to-[#36F5D4] shadow-2xl  rounded-2xl"
                onClick={handleSubmit(UpdateInfo)}
                 type="button"
                >Update Vitals</button>
             <button className="bg-gradient-to-r w-[20%] p-2  from-[#BBF6AB] to-[#36F5D4] shadow-2xl  rounded-2xl"
               
                 type="reset"
                >Reset Info
                </button>   
      </div>
       
    </div>
    </form>
  );
}
