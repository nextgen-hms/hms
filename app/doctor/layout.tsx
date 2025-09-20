"use client";
import { PatientContextProvider } from "@/contexts/PatientIdContext";
import { Heading1 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
export default function Receptionist({
  queue,
   patientDetails,
   pharmacyOrder,
   labOrder,
   pastVisits
}: {
  queue: React.ReactNode;
   patientDetails:React.ReactNode;
   pharmacyOrder:React.ReactNode;
   labOrder:React.ReactNode;
   pastVisits:React.ReactNode;
}) {
  const [selectedTab, setSelectedTab] = useState("patientDetails");

  return (
    <div className="flex flex-col h-screen w-screen "> 
      {/* Clinic Header */}
      <div className=" border-1 border-black/30  flex items-center justify-center">
        <div className="relative h-[7dvh] w-[7dvh]">
          <Image src="/logo.png" alt="Clinic Logo" fill sizes="7dvh"></Image>
        </div>
        <h1 className="text-3xl font-bold text-green-800/80">
          Dr Bablu Clinic
        </h1>
      </div>
      {/* Receptionist Header */}
      <div className=" border-1  border-black/30  flex items-center justify-center">
        <h1 className="text-2xl p-4 font-bold text-green-800/80">
          Doctor's View
        </h1>
      </div>
      {/* container containg  qeue and tabs and their implemntations */}
      <div id="container-containing-queue-and-tabs" className="flex  space-x-4  w-full h-full">
        <PatientContextProvider>
          {/* queue paralell route */}
           <div id="Queue" className="">{queue}</div>
           {/* div containing tabs and their implemetations */}
          <div   className=" p-2 rounded-2xl border-black/30 border-2  w-full"> 
              <div id="tab" className=" w-[60%]  p-2 border-2 border-black/30    rounded-4xl flex items-center gap-2 bg-gray-300 ">
                <button className={`  px-4    text-center ${selectedTab === "patientDetails" ? "bg-green-400 rounded-3xl border-black/30 border-2": null}`}
                    onClick={()=> setSelectedTab("patientDetails")}
                >
                  Patient Details
                </button>
                <button className={` px-4      text-center  ${selectedTab === "pharmacy" ? "bg-green-400 rounded-3xl border-black/30 border-2": null}`}
                   onClick={()=> setSelectedTab("pharmacy")}
                >
                  Pharmacy Order
                </button>
                <button className={` px-4     text-center  ${selectedTab === "labOrder" ? "bg-green-400 rounded-3xl border-black/30 border-2": null}`}
                  onClick={()=> setSelectedTab("labOrder")}
                >
                  Lab Order
                </button>
                <button className={` px-4     text-center  ${selectedTab === "pastVisits" ? "bg-green-400 rounded-3xl border-black/30 border-2": null}`}
                onClick={()=> setSelectedTab("pastVisits")}
                >
                  Past visits
                </button>
                <button className={` px-4     text-center  ${selectedTab === "reportResults" ? "bg-green-400 rounded-3xl border-black/30 border-2": null}`}
                onClick={()=> setSelectedTab("reportResults")}
                >
                  Report Results
                </button>
              </div>

              <div id="tab-paralell-routes" className=" ">
                 {selectedTab === "patientDetails" ? patientDetails : null}
                 {selectedTab === "pharmacy" ? pharmacyOrder : null}
                 {selectedTab === "labOrder" ? labOrder: null}
                 {selectedTab === "pastVisits" ? pastVisits : null}
              </div>
            
          </div>
          
          
        </PatientContextProvider>
         
      </div>
      
    </div>
  );
}
