"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod"; 
import toast from "react-hot-toast";

const MenstrualHistorySchema=z.object({
    patient_id:z.string(),
    menarch_age:z.string(),
    cycle_length_days:z.string(),
    bleeding_days:z.string(),
    menstrual_regular:z.string(),
    contraception_history:z.string(),
    gynecologic_surgeries:z.string(),
    medical_conditions:z.string(),
    menopause_status:z.string()

});
type MenstrualHistoryForm=z.infer<typeof MenstrualHistorySchema>
export default function MenstrualHistory({
  patientId,
}: {
  patientId: string | null;
}) {
  const {
      register,
      handleSubmit,
      watch,
      formState: { errors, isSubmitting },
      setValue,
      reset
    } = useForm<MenstrualHistoryForm>({
        mode: "onChange",
        resolver:zodResolver(MenstrualHistorySchema)
    });
    useEffect(()=>{
    if(patientId) getMenstrualHistory()
    },[patientId])
  async function getMenstrualHistory() {
    console.log(patientId);
    try{
         const res = await fetch(`api/clinicalDetails/gynaecologist/menstrualHistory/${patientId}`);
    const data = await res.json();
    if(res.ok){
        toast.success("succefully fetched data");
        reset(data);
    }
    else{
        toast.error(`failed to fetch data ${data.error}`)
    }
    }catch(err){
        console.error(err);
        toast.error("failed to fetch from db err")
    }
  
 
  }
  async function postMenstrualHistory(data:any) {
      let formData={...data,patient_id:patientId};
      console.log(formData);
      
    try{
         const res=await fetch('/api/clinicalDetails/gynaecologist/menstrualHistory',{
          method:"POST",
          body:JSON.stringify(formData)
        });
        console.log(await res.json());
        
        if(res.ok){toast.success("menstrual history added successfully");}
    }catch(err){
        console.log(err);
        
        toast.error("failed to add menstrual history");
    }
     

       
        
  }
    async function updateMenstrualHistory(data:any) {
   let formData={...data,patient_id:patientId};
      console.log(formData);
      
    try{
         const res=await fetch('/api/clinicalDetails/gynaecologist/menstrualHistory',{
          method:"PATCH",
          body:JSON.stringify(formData)
        });
        console.log(await res.json());
        
        if(res.ok){toast.success("menstrual history updated successfully");}
    }catch(err){
        console.log(err);
        
        toast.error("failed to update menstrual history");
    }
  }
  return (
    <div >
        <form >
          <div className="w-2/3  border-black/40 grid grid-cols-2  p-4 space-y-5">
            <div className="col-span-2">
              <h1 className="text-2xl pl-2 font-semibold  rounded-2xl border-black/30 w-[60%] text-black/70">
                Menstrual History
              </h1>
            </div>
            <div className="flex flex-col ">
              <label
                htmlFor="menarchAge"
                className="px-2 pb-1 text-sm text-black/70 "
              >
                Menarch Age:
              </label>
              <input
                id="menarchAge"
                type="text"
                placeholder="Enter Menarch Age "
                className="w-[80%] p-2  bg-gray-200 rounded-2xl "
                {...register("menarch_age")}
              />
            </div>

            <div className="flex flex-col ">
              <label
                htmlFor="cycleLengthDays"
                className="px-2 pb-1 text-sm text-black/70 "
              >
                Cycle Length Days:
              </label>
              <input
                id="cycleLengthDays"
                type="number"
                placeholder="Enter Cycle Length Days"
                className="w-[80%] p-2 bg-gray-200  rounded-2xl "
                {...register("cycle_length_days")}
              />
            </div>
            <div className="flex flex-col ">
              <label
                htmlFor="bleeding"
                className="px-2 pb-1 text-sm text-black/70 "
              >
                Bleeding Duration Days:
              </label>
              <input
                id="bleeding"
                type="number"
                placeholder="Enter Bleeding Duration Days"
                className="w-[80%] p-2 bg-gray-200  rounded-2xl "
                {...register("bleeding_days")}
              />
            </div>

            <div className="flex flex-col ">
              <label
                htmlFor="menstrual"
                className="px-2 pb-1 text-sm text-black/70 "
              >
                Menstrual Regular:
              </label>
              <select
                id="menstrual"
                className="w-[80%] p-2  bg-gray-200 rounded-2xl text-black/50"
                {...register("menstrual_regular")}
              >
                <option value="" hidden>Select True or False</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
            <div className="flex flex-col ">
              <label
                htmlFor="contraceptionHistory"
                className="px-2 pb-1 text-sm text-black/70 "
              >
                contraception History:
              </label>
              <input
                id="contraceptionHistory"
                type="text"
                placeholder="Contraception History"
                className="w-[80%] p-2  bg-gray-200 rounded-3xl "
                {...register("contraception_history")}
              />
            </div>
            <div className="flex flex-col ">
              <label
                htmlFor="gynecologicSurgeries"
                className="px-2 pb-1 text-sm text-black/70 "
              >
                Gynecologic Surgeries:
              </label>
              <input
                id="gynecologicSurgeries"
                type="text"
                placeholder="Gynaecology Surgeries"
                className="w-[80%] p-2  bg-gray-200 rounded-3xl "
                {...register("gynecologic_surgeries")}
              />
            </div>
            <div className="flex flex-col ">
              <label
                htmlFor="medicalConditions"
                className="px-2 pb-1 text-sm text-black/70 "
              >
                medical Conditions:
              </label>
              <input
                id="medicalConditions"
                type="text"
                placeholder="Medical Conditions"
                className="w-[80%] p-2  bg-gray-200 rounded-3xl "
                {...register("medical_conditions")}
              />
            </div>
                 <div className="flex flex-col ">
              <label
                htmlFor="mennopause_status"
                className="px-2 pb-1 text-sm text-black/70 "
              >
                Menopause Status:
              </label>
              <select
                id="menopause_status"
                className="w-[80%] p-2  bg-gray-200 rounded-2xl text-black/50"
                {...register("menopause_status")}
              >
                <option value="" hidden>Select status</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
            <div className="flex space-x-6 col-span-2 pt-2">
              <button
                className="bg-gradient-to-r w-[20%] p-2  from-[#BBF6AB] to-[#36F5D4] shadow-2xl  rounded-2xl"
                onClick={handleSubmit(postMenstrualHistory)}
              >
                Add Info
              </button>
              <button
                className="bg-gradient-to-r w-[20%] p-2  from-[#BBF6AB] to-[#36F5D4] shadow-2xl  rounded-2xl"
                onClick={handleSubmit(updateMenstrualHistory)}
              >
                Update Info
              </button>
              <button
                className="bg-gradient-to-r w-[20%] p-2  from-[#BBF6AB] to-[#36F5D4] shadow-2xl  rounded-2xl"
                type="reset"
              >
                Reset Info
              </button>
            </div>
          </div>
        </form>
    </div>
  );
}
