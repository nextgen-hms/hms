"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod"; 
import toast from "react-hot-toast";

const  ObstetricHistorySchema=z.object({
    patient_id:z.string(),
    is_first_pregnancy:z.string(),
    married_years:z.string(),
    gravida:z.string(),
    para:z.string(),
    abortions:z.string(),
    edd:z.string(),
    last_menstrual_cycle:z.string(),
    notes:z.string()
});
type ObstetricHistoryForm=z.infer<typeof ObstetricHistorySchema>
export default function ObstetricHistory({
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
    } = useForm<ObstetricHistoryForm>({
        mode: "onChange",
        resolver:zodResolver(ObstetricHistorySchema)
    });
   useEffect(()=>{
      if(patientId)getObstetricHistory();
   },[patientId])
  async function getObstetricHistory() {
    console.log(patientId);
    try{
         const res = await fetch(`api/clinicalDetails/gynaecologist/obstetric/${patientId}`);
    const data = await res.json();
    if(res.ok){
        toast.success("succefully fetched data");
        console.log(data);
        reset({...data,
            last_menstrual_cycle:data.last_menstrual_cycle.split("T")[0],
            edd:data.edd.split("T")[0]
        });
    }
    else{
        toast.error(`failed to fetch data ${data.error}`)
    }
    }catch(err){
        console.error(err);
        toast.error("failed to fetch from db err")
    }
  
 
  }
  async function postObstetricHistory(data:any) {
      let formData={...data,patient_id:patientId};
      console.log(formData);
      
    try{
         const res=await fetch('/api/clinicalDetails/gynaecologist/obstetric',{
          method:"POST",
          body:JSON.stringify(formData)
        });
        const res_data=(await res.json());
        console.log(res_data);
        
        if(res.ok){toast.success("obstetric history added successfully");}
        else{
          toast.error(`do not able to add again ${res_data.detail}`)
        }
    }catch(err){
        console.log(err);
        
        toast.error("failed to add obstetric history");
    }
     

       
        
  }
    async function updateObstetricHistory(data:any) {
   let formData={...data,patient_id:patientId};
      console.log(formData);
      
    try{
         const res=await fetch('/api/clinicalDetails/gynaecologist/obstetric',{
          method:"PATCH",
          body:JSON.stringify(formData)
        });
        console.log(await res.json());
        
        if(res.ok){toast.success("Current Pregnancy updated successfully");}
    }catch(err){
        console.log(err);
        
        toast.error("failed to update Current Pregnancy");
    }
  }
  return (
    <div >
        <form >
          <div className="w-2/3 border-black/40 grid grid-cols-2 p-4 space-y-3">
            <div className="col-span-2">
              <h1 className="text-2xl pl-2 font-semibold rounded-2xl border-black/30 w-[60%] text-black/70">
                Obstetric History
              </h1>
          
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="isFirstPregnancy"
                className="px-2 pb-1 text-sm text-black/70"
              >
                Is First Pregnancy:
              </label>
              <select
                id="isFirstPregnancy"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl text-black/50"
                {...register("is_first_pregnancy")}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="marriedYears"
                className="px-2 pb-1 text-sm text-black/70"
              >
                Married Years:
              </label>
              <input
                id="marriedYears"
                type="number"
                placeholder="Years Married"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register("married_years")}
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="gravida"
                className="px-2 pb-1 text-sm text-black/70"
              >
                Gravida:
              </label>
              <input
                id="gravida"
                type="number"
                placeholder="Total Pregnancies"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register("gravida")}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="para" className="px-2 pb-1 text-sm text-black/70">
                Para:
              </label>
              <input
                id="para"
                type="number"
                placeholder="Pregnancies >6 months"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register("para")}
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="lastMenstrualCycle"
                className="px-2 pb-1 text-sm text-black/70"
              >
                Last Menstrual Cycle:
              </label>
              <input
                id="lastMenstrualCycle"
                type="date"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register("last_menstrual_cycle")}
              />
            </div>

            
            <div className="flex flex-col">
              <label htmlFor="abortions" className="px-2 pb-1 text-sm text-black/70">
                Abortions:
              </label>
              <input
                id="abortions"
                type="text"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register("abortions")}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="edd" className="px-2 pb-1 text-sm text-black/70">
                Expected Date of Delivery (EDD):
              </label>
              <input
                id="edd"
                type="date"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register("edd")}
              />
            </div>

            <div className="flex flex-col col-span-2">
              <label
                htmlFor="notes"
                className="px-2 pb-1 text-sm text-black/70"
              >
                Notes:
              </label>
              <textarea
                id="notes"
                placeholder="Enter any special notes"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register("notes")}
              ></textarea>
            </div>

            <div className="flex space-x-6 col-span-2 pt-2">
              <button
                className="bg-gradient-to-r w-[20%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
                onClick={handleSubmit(postObstetricHistory)}
              >
                Add Info
              </button>
              <button
                className="bg-gradient-to-r w-[20%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
                onClick={handleSubmit(updateObstetricHistory)}
              >
                Update Info
              </button>
              <button
                className="bg-gradient-to-r w-[20%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
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
