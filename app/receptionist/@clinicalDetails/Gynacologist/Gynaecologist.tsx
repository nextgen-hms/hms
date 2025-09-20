"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import ParaDetailsForm from "./allForms/ParaDetaisl";
import MenstrualHistory from "./allForms/MenstrualHistory";
import CurrentPregnancy from "./allForms/CurrentPregnancy";
import ObstetricHistory from "./allForms/ObstetricHistory";
import { useClinicalDetails } from "@/contexts/ClinicalDetailsContext";
export default function Gynaecologist({
  patientId,
}: {
  patientId: string | null;
}) {
  const [selectedTab, setSelectedTab] = useState("menstrual");
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
   
   const {activeTabClinicalDetails,setActiveTabClinicalDetails}=useClinicalDetails();
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
 
  
 console.log(activeTabClinicalDetails);
 
  return (
    
    <div >
      {activeTabClinicalDetails === "Menstrual History" && (<MenstrualHistory patientId={patientId}></MenstrualHistory>)}
      {activeTabClinicalDetails === "Current Pregnancy" && (<CurrentPregnancy patientId={patientId}></CurrentPregnancy>      )}
      {activeTabClinicalDetails === "Obstetric History" && (<ObstetricHistory patientId={patientId}></ObstetricHistory>      )}
       {activeTabClinicalDetails === "Para Details" && ( < ParaDetailsForm   selectedTab={selectedTab} ></ParaDetailsForm>)}
    </div>
  );
}
