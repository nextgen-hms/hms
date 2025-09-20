"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod"; 
import toast from "react-hot-toast";

const  CurrentPregnancySchema=z.object({
    patient_id:z.string(),
    visit_id:z.string(),
    multiple_pregnancy:z.string(),
    complications:z.string(),
    ultrasound_findings:z.string(),
    fetal_heart_rate_bpm:z.string(),
    placenta_position:z.string(),
    presentation:z.string(),
    gestational_age_weeks:z.string(),
    notes:z.string()
});
type MenstrualHistoryForm=z.infer<typeof CurrentPregnancySchema>
export default function CurrentPregnancy({
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
        resolver:zodResolver(CurrentPregnancySchema)
    });
    const [v_visit_id,setv_visit_id]=useState("");
    useEffect(()=>{
    if(patientId) {getCurrentPregnancy();
        getVisitId();
    }
    },[patientId])
     async function getVisitId() {
    console.log(patientId);
    try{
         const res = await fetch(`api/clinicalDetails/gynaecologist/currentPregnancy/getVisitId/${patientId}`);
    const data = await res.json();
    if(res.ok){
        toast.success("succefully fetched visit_id");
        console.log(data.max);
        
        setv_visit_id(data.max);
    }
    else{
        toast.error(` first add patient in Queue( ${data.error})`)
    }
    }catch(err){
        console.error(err);
        toast.error("failed to fetch visit_id from db err")
    }
  
 
  }

  async function getCurrentPregnancy() {
    console.log(patientId);
    try{
         const res = await fetch(`api/clinicalDetails/gynaecologist/currentPregnancy/${patientId}`);
    const data = await res.json();
    if(res.ok){
        toast.success("succefully fetched data");
        console.log(data);
        
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
  async function postCurrentPregnancy(data:any) {
      let formData={...data,patient_id:patientId,visit_id:v_visit_id};
      console.log(formData);
      
    try{
         const res=await fetch('/api/clinicalDetails/gynaecologist/currentPregnancy',{
          method:"POST",
          body:JSON.stringify(formData)
        });
        const res_data=(await res.json());
        console.log(res_data);
        
        if(res.ok){toast.success("current pregnancy added successfully");}
        else{
          toast.error(`do not able to add again ${res_data.detail}`)
        }
    }catch(err){
        console.log(err);
        
        toast.error("failed to add current pregnancy");
    }
     

       
        
  }
    async function updateCurrentPregnancy(data:any) {
   let formData={...data,patient_id:patientId,visit_id:v_visit_id};
      console.log(formData);
      
    try{
         const res=await fetch('/api/clinicalDetails/gynaecologist/currentPregnancy',{
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
        <form>
          <div className="w-2/3 border-black/40 grid grid-cols-2 p-4 space-y-5">
            <div className="col-span-2">
              <h1 className="text-2xl pl-2 font-semibold rounded-2xl border-black/30 w-[60%] text-black/70">
                Current Pregnancy
              </h1>
              <h1>Visit Id : {v_visit_id}</h1>
            </div>
            {/* <div className="flex flex-col">
              <label
                htmlFor="visit"
                className="px-2 pb-1 text-sm text-black/70"
              >
                Visit_id:
              </label>
              <input
                id="visit"
                type="text"
                placeholder="Visit_Id"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register("visit_id")}
              />
            </div> */}
            <div className="flex flex-col">
              <label
                htmlFor="multiple_pregnancy"
                className="px-2 pb-1 text-sm text-black/70"
              >
                Multiple Pregnancy:
              </label>
              <select
                id="multiple_pregnancy"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl text-black/50"
                {...register("multiple_pregnancy")}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="complications"
                className="px-2 pb-1 text-sm text-black/70"
              >
                Complications:
              </label>
              <input
                id="complications"
                type="text"
                placeholder="Enter Complications"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register("complications")}
              />
            </div>

           
            <div className="flex flex-col">
              <label
                htmlFor="ultrasound_findings"
                className="px-2 pb-1 text-sm text-black/70"
              >
                Ultrasound Findings:
              </label>
              <input
                id="ultrasound_findings"
                type="text"
                placeholder="Enter Ultrasound Findings"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register("ultrasound_findings")}
              />
            </div>
                
            <div className="flex flex-col">
              <label
                htmlFor="fetal_heart_rate"
                className="px-2 pb-1 text-sm text-black/70"
              >
                Fetal Heart Rate:
              </label>
              <input
                id="fetal_heart_rate"
                type="text"
                placeholder="Enter Fetal Heart Rate"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register("fetal_heart_rate_bpm")}
              />
            </div>

             <div className="flex flex-col">
              <label
                htmlFor="placenta_position"
                className="px-2 pb-1 text-sm text-black/70"
              >
                Placenta Position:
              </label>
              <select id="placenta_positon" 
              className="bg-gray-200 w-[80%] rounded-2xl p-2"
              > 
                <option value="" hidden>select placenta position</option>   
                <option value="Right">Right</option>
                <option value="Left">Left</option>
              </select>
            </div>
                     
            <div className="flex flex-col">
              <label
                htmlFor="presentation"
                className="px-2 pb-1 text-sm text-black/70"
              >
                Presentation:
              </label>
              <input
                id="presentation"
                type="text"
                placeholder="Enter Presentation"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register("presentation")}
              />
            </div>
                     
            <div className="flex flex-col">
              <label
                htmlFor="gestational_age_weeks"
                className="px-2 pb-1 text-sm text-black/70"
              >
                Gestational Age Weeks:
              </label>
              <input
                id="gestational_age_weeks"
                type="text"
                placeholder="Enter Fetal Heart Rate"
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register("gestational_age_weeks")}
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="notes"
                className="px-2 pb-1 text-sm text-black/70"
              >
                Notes:
              </label>
              <textarea
                id="notes"
                placeholder='Write Notes here'
                className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                {...register("notes")}
              />
            </div>

            <div className="flex space-x-6 col-span-2 pt-2">
              <button
                className="bg-gradient-to-r w-[20%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
                onClick={handleSubmit(postCurrentPregnancy)}
              >
                Add Info
              </button>
              <button
                className="bg-gradient-to-r w-[20%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
                onClick={handleSubmit(updateCurrentPregnancy)}
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
