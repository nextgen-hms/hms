"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import ParaDetailsForm from "./allForms/ParaDetaisl";
import MenstrualHistory from "./allForms/MenstrualHistory";
import CurrentPregnancy from "./allForms/CurrentPregnancy";
import ObstetricHistory from "./allForms/ObstetricHistory";

export default function Gynaecologist({
  patientId,
}: {
  patientId: string | null;
}) {
  const [selectedTab, setSelectedTab] = useState("Menstrual History");
  const {
      register,
      handleSubmit,
      watch,
      formState: { errors, isSubmitting },
      setValue,
      reset
    } = useForm({
        mode: "onChange",
    });
   
  
  async function getObstetricHistory() {
    const res = await fetch(`api/clinicalDetails/gynaecologist/obstetric/${patientId}`);
    const data = await res.json();
    console.log(data);
     
   reset(data);
  }
  async function postObstetricHistory(data:any) {
        const res=await fetch('/api/clinicalDetails/gynaecologist/obstetric',{
          method:"POST",
          body:JSON.stringify(data)
        })

        console.log(data , "done");
        
  }
    async function updateObstetricHistory(data:any) {
        const res=await fetch('/api/clinicalDetails/gynaecologist/obstetric',{
          method:"PATCH",
          body:JSON.stringify(data)
        })

        console.log(data , "done");
        
  }
 

 
  return (
    <div className="pt-4">
    <div
            id="tab"
            className=" w-[60%] p-2  border-2 border-black/30   rounded-4xl flex items-center  bg-gray-300 "
          >
            <button
              className={`  px-4    text-center ${
                selectedTab === "Menstrual History"
                  ? "bg-green-400 rounded-3xl border-black/30 border-2"
                  : null
              }`}
              onClick={() => setSelectedTab("Menstrual History")}
            >
              Menstrual History
            </button>
            <button
              className={` px-4      text-center  ${
                selectedTab === "Current Pregnancy"
                  ? "bg-green-400 rounded-3xl border-black/30 border-2"
                  : null
              }`}
              onClick={() => setSelectedTab("Current Pregnancy")}
            >
              Current Pregnancy
            </button>
            <button
              className={` px-4     text-center  ${
                selectedTab === "Obstetric History"
                  ? "bg-green-400 rounded-3xl border-black/30 border-2"
                  : null
              }`}
              onClick={() => setSelectedTab("Obstetric History")}
            >
              Obstetric History
            </button>
            <button
              className={` px-4     text-center  ${
                selectedTab === "Para Details"
                  ? "bg-green-400 rounded-3xl border-black/30 border-2"
                  : null
              }`}
              onClick={() => setSelectedTab("Para Details")}
            >
              Para Details
            </button>
          


          </div>
    <div >
      {selectedTab === "Menstrual History" && (<MenstrualHistory ></MenstrualHistory>)}
      {selectedTab === "Current Pregnancy" && (<CurrentPregnancy ></CurrentPregnancy>      )}
      {selectedTab === "Obstetric History" && (<ObstetricHistory ></ObstetricHistory>      )}
       {selectedTab === "Para Details" && ( < ParaDetailsForm   ></ParaDetailsForm>)}
    </div>
    </div>
  );
}
