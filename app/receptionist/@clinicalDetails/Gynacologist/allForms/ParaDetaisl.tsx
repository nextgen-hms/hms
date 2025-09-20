"use client";
import { useEffect,useState } from "react";
import toast from "react-hot-toast";
import { usePatient } from "@/contexts/PatientIdContext";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const ParaDetailSchema = z.object({
  obstetric_history_id: z.string().optional(),
  para_number: z.string().optional(),
  birth_year: z.string().optional(),
  birth_month: z.string().optional(),
  gender: z.string().optional(),
  delivery_type: z.string().optional(),
  alive: z.string().optional(),
  birth_weight_grams: z.string().optional(),
  complications: z.string().optional(),
  notes: z.string().optional(),
  gestational_age_weeks: z.string().optional(),
});
type ParaDetail = {
  obstetric_history_id?: string | number;
  para_number?: string | number;
  birth_year?: string | number;
  birth_month?: string | number;
  gender?: string;
  delivery_type?: string;
  alive?: string;
  birth_weight_grams?: string | number;
  complications?: string;
  notes?: string;
  gestational_age_weeks?: string | number;
};

type ParaDetailsFormType = {
  para: ParaDetail[];
};
// const ParaDetailSchemaForm = z.object({ para: z.array(ParaDetailSchema) });
// type ParaDetails = z.infer<typeof ParaDetailSchemaForm>;

export default function ParaDetailsForm({
  selectedTab,
}: {
  selectedTab: string;
}) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ParaDetailsFormType>({
    
  });
  const { patientId } = usePatient();
  const { fields, remove, append } = useFieldArray({
    control,
    name: "para",
  });
   const [o_hid,setO_hid]=useState("");
   const [o_para_hid,setO_para_hid]=useState("");
    useEffect(()=>{
    if(patientId) {
        getObstetricHistoryId();
    }
    },[patientId]);

    async function getObstetricHistoryId() {
      
    try{
         const res = await fetch(`api/clinicalDetails/gynaecologist/obstetric/${patientId}`);
    const data = await res.json();
    if(res.ok){
      if(data.para >0){
          toast.success("succefully fetched ohid data");
          setO_para_hid(data.obstetric_history_id);
          setO_hid(data.obstetric_history_id);
        }else{
          setO_para_hid(data.obstetric_history_id);
          reset({para:[]});
          toast.error("paras are of 0 length")
        }
    }
    else{
      setO_hid("");
      setO_para_hid("");
      reset({para:[]});
        toast.error(`first patiet should store obstetric history( ${data.error})`)
    }
    }catch(err){
        setO_hid("");
       
        console.error(err);
        toast.error("failed to fetch from db err")
    }
 
 
  }
    useEffect(()=>{
    if(o_hid) {
        getPara();
    }
    },[o_hid]);


  async function getPara() {
      console.log(` get para patient id ${patientId}, obs id :${o_hid}`);
    
        const res = await fetch(
      `api/clinicalDetails/gynaecologist/para/${o_hid}`
    );
    const data = await res.json();
   console.log({para:Array.isArray(data) ? data : [data]});
   
    reset({para:Array.isArray(data) ? data : [data]});
  }
  async function postPara(data:any) {
    const formData={
      para:data.para.map((item:any,index:number)=>({
        ...item,
        obstetric_history_id:o_para_hid,
        para_number:index+1
      }))
    };
    console.log(formData);
    
    
    
     
    const res = await fetch("/api/clinicalDetails/gynaecologist/para", {
      method: "POST",
      body: JSON.stringify(formData),
    });
      if(res.ok){
    toast.success("added sucessfuly")
  }else{
    toast.error("error while adding ")
  }
      console.log(await res.json());
  }
  async function updatePara(data: any) {
     const formData={
      para:data.para.map((item:any,index:number)=>({
        ...item,
        obstetric_history_id:o_para_hid,
        para_number:index+1
      }))
    };
    console.log(formData);
    
    const res = await fetch("/api/clinicalDetails/gynaecologist/para", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  if(res.ok){
    toast.success("updated sucessfuly")
  }else{
    toast.error("error while updating ")
  }
  console.log(await res.json());
  
  }




  return (
    <form>
      <div className="col-span-2 flex  px-4 mt-4">
        <h1 className="text-2xl pl-2 font-semibold rounded-2xl border-black/30 w-[60%] text-black/70">
          Para Details
        </h1>
            <h1>obstetric_history_id : {o_para_hid}</h1>
        <div className="w-full flex  space-x-2.5">
          <button
            type="button"
            className="bg-gradient-to-r w-[20%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
            onClick={() =>
              append({
                obstetric_history_id: "",
                para_number: "",
                birth_year: "",
                birth_month: "",
                gender: "Male",
                delivery_type: "Normal",
                alive: "true",
                birth_weight_grams: "",
                complications: "", 
                notes: "",
                gestational_age_weeks: "", 
              })
            }
          >
            Add Para
          </button>
          <button
            className="bg-gradient-to-r w-[20%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
            type="button"
            onClick={handleSubmit(postPara)}
          >
            submit
          </button>
          <button
            className="bg-gradient-to-r w-[20%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
            type="button"
            onClick={handleSubmit(updatePara)}
          >
            Update Info
          </button>
        </div>
      </div>
      <div className="max-h-[500px] overflow-y-scroll h-[400px] custom-scrollbar">
        {fields.map((field, index) => {
          return (
            <div
              key={`para-${field.id}`}
              className="w-2/3 border-black/40 grid grid-cols-2 px-4  space-y-3"
            >
              <div className="col-span-2">
                <h1 className="text-xl pl-2 font-semibold rounded-2xl border-black/30 w-[60%] text-black/70">
                  Para No {index + 1}
                </h1>
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="birthyear"
                  className="px-2 pb-1 text-sm text-black/70"
                >
                  Birth Year :
                </label>
                <input
                  id="birthyear"
                  className="w-[80%] p-2 bg-gray-200 rounded-2xl text-black/50"
                  {...register(`para.${index}.birth_year`)}
                  type="text"
                  placeholder="Enter Birth Year"
                />
                  <input
                
                  {...register(`para.${index}.para_number`)}
                  defaultValue={index+1}
                  type="hidden"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="birth_month"
                  className="px-2 pb-1 text-sm text-black/70"
                >
                  Birth Month:
                </label>
                <input
                  id="birth_month"
                  type="text"
                  placeholder="Birth Month"
                  className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                  {...register(`para.${index}.birth_month`)}
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="gender"
                  className="text-sm px-2 pb-1 text-black/70"
                >
                  Gender :
                </label>
                <select
                  id="gender"
                  className="bg-black/10 w-[80%] p-2  rounded-2xl outline-none text-black "
                  {...register(`para.${index}.gender`)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="delivery_type"
                  className="text-sm px-2 pb-1 text-black/70"
                >
                  Delivery Type :
                </label>
                <select
                  id="delivery_type"
                  className="bg-black/10 w-[80%] p-2  rounded-2xl outline-none text-black "
                  {...register(`para.${index}.delivery_type`)}
                >
                  <option value="Normal">Normal</option>
                  <option value="C-Section">C-Section</option>
                  <option value="AssistedVD">Assisted Vd</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="alive"
                  className="text-sm px-2 pb-1 text-black/70"
                >
                  Alive :
                </label>
                <select
                  id="alive"
                  className="bg-black/10 w-[80%] p-2  rounded-2xl outline-none text-black "
                  {...register(`para.${index}.alive`)}
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
              
               
              <div className="flex flex-col">
                <label
                  htmlFor="birth_weight"
                  className="px-2 pb-1 text-sm text-black/70"
                >
                  Birth Weight in grams:
                </label>
                <input
                  id="birth_weight"
                  type="text"
                  placeholder="Birth Weight in grams"
                  className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                  {...register(`para.${index}.birth_weight_grams`)}
                />
              </div>
               <div className="flex flex-col">
                <label
                  htmlFor="gestational_age_weeks"
                  className="px-2 pb-1 text-sm text-black/70"
                >
                  Gestational age weeks:
                </label>
                <input
                  id="gestational_age_weeks"
                  type="text"
                  placeholder="Gestational age weeks"
                  className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                  {...register(`para.${index}.gestational_age_weeks`)}
                />
              </div>
                <div className="flex flex-col">
                <label
                  htmlFor="Complications"
                  className="px-2 pb-1 text-sm text-black/70"
                >
                  Complications:
                </label>
                <input
                  id="Complications"
                  type="text"
                  placeholder="Enter Complications"
                  className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                  {...register(`para.${index}.complications`)}
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
                  placeholder="Any complications, e.g., NICU stay, congenital anomaly"
                  className="w-[80%] p-2 bg-gray-200 rounded-2xl"
                  {...register(`para.${index}.notes`)}
                ></textarea>
              </div>
              <button
                className="bg-gradient-to-r w-[40%] p-2 from-[#BBF6AB] to-[#36F5D4] shadow-2xl rounded-2xl"
                type="button"
                onClick={() => remove(index)}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
    </form>
  );
}
