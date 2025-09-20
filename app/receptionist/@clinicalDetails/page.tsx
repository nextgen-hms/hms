"use client";

import { usePatient } from "@/contexts/PatientIdContext";
import { register } from "module";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Gynaecologist from "./Gynacologist/Gynaecologist";
import { ClinicalDetailsProvider } from "@/contexts/ClinicalDetailsContext";
export default function PatientRegistration() {
  const [pId, setpId] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("Gynaecologist");
 
  const { patientId, setPatientId } = usePatient();
  useEffect(()=>{
    if(patientId){
      setpId(patientId);
    }
  },[patientId])
  return (
    <>
      <div className="flex flex-col px-4 py-2 ">
        <label
          htmlFor="specialization"
          className="px-2 pb-1 text-sm text-black/70"
        >
          Specalization
        </label>
        <select
          value={specialization}
          name=""
          id="specialization"
          className="w-[26.5%] p-2  bg-gray-200 rounded-2xl"
          onChange={(e) => setSpecialization(e.target.value)}
        >
          <option value="Gynaecologist">Gynaecologist</option>
          <option value="Daermaetologist">Daermaetologist</option>
          <option value="childSpecialist">ChildSpecialist</option>
        </select>
      </div>
      <div className="flex flex-col col-span-2 px-4 ">
        <label htmlFor="pid" className="px-2 pb-1 text-sm text-black/70 ">
          Patient Id:
        </label>
        <input
          id="pid"
          type="text"
          placeholder="Enter existing Patient Id"
          className=" w-[26.5%] p-2  bg-gray-200 rounded-2xl "
          value={pId}
          onChange={(e) => setpId(e.target.value)}
           onKeyDown={(e)=>{
                if(e.key === "Enter"){
                    setPatientId(pId);
                    
                }
              }}
        />
      </div>
      {specialization === "Gynaecologist" ? (
        <div  >
          <ClinicalDetailsProvider>

            <Gynaecologist patientId={patientId}></Gynaecologist>
          </ClinicalDetailsProvider>
            {/* <RepeatableFrom></RepeatableFrom> */}
          </div>   
      ) : null}
    </>
  );
}
