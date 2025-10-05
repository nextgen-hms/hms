"use client";
import {
  PatientContextProvider,
  usePatient,
} from "@/contexts/PatientIdContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useSidebar } from "@/contexts/SidebarContext";
import Image from "next/image";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
export default function Receptionist({
  queue,
  queueManagement,
  patientRegistration,
  patientVitals,
  clinicalDetails,
  sidebar,
}: {
  queue: React.ReactNode;
  queueManagement: React.ReactNode;
  patientRegistration: React.ReactNode;
  patientVitals: React.ReactNode;
  clinicalDetails: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  const [selectedTab, setSelectedTab] = useState("queue");
  const { patientId } = usePatient();
  const { activeTab } = useSidebar();
  console.log(activeTab);
  return (
    <div className="flex flex-col h-[100vh] w-[100vw] ">
      {/* Clinic Header */}


       <div className=" border-1 border-black/30  flex items-center justify-center">
     <div className="relative h-10 w-10">
  <Image src="/logo.png" alt="Clinic Logo" fill />
</div>
        <h1 className="text-3xl font-bold text-green-800/80">
          Dr Bablu Clinic
        </h1>
      </div> 
      {/* Receptionist Header */}
       <div className=" border-1  border-black/30  flex items-center justify-center">
        <h1 className="text-2xl p-4 font-bold text-green-800/80">
          Receptionist View
        </h1>
      </div> 
      {/* container containg  qeue and tabs and their implemntations */}
      <div
        id="container-containing-queue-and-tabs"
        className="flex h-full w-full"
      >
       
         
               <div id="Queue" className="">
          {queue}
        </div>

        {/* queue paralell route */}

        {/* div containing tabs and their implemetations */}
        <div className=" p-2 rounded-2xl border-black/30 flex flex-col  w-full h-full">
          <div
            id="tab"
            className=" w-[60%] p-2  border-2 border-black/30   rounded-4xl flex items-center  bg-gray-300 "
          >
            <button
              className={`  px-4    text-center ${
                selectedTab === "queue"
                  ? "bg-green-400 rounded-3xl border-black/30 border-2"
                  : null
              }`}
              onClick={() => setSelectedTab("queue")}
            >
              Queue Mangement
            </button>
            <button
              className={` px-4      text-center  ${
                selectedTab === "patientRegistration"
                  ? "bg-green-400 rounded-3xl border-black/30 border-2"
                  : null
              }`}
              onClick={() => setSelectedTab("patientRegistration")}
            >
              Patient Registration
            </button>
            <button
              className={` px-4     text-center  ${
                selectedTab === "patientVitals"
                  ? "bg-green-400 rounded-3xl border-black/30 border-2"
                  : null
              }`}
              onClick={() => setSelectedTab("patientVitals")}
            >
              Patient Vitals
            </button>
            <button
              className={` px-4     text-center  ${
                selectedTab === "clinicalDetails"
                  ? "bg-green-400 rounded-3xl border-black/30 border-2"
                  : null
              }`}
              onClick={() => setSelectedTab("clinicalDetails")}
            >
              Clinical Details
            </button>
          


          </div>

          <div id="tab-paralell-routes" className="relative  ">
            <div className="absolute top-2  left-50">
            
            </div>
            {selectedTab === "queue" ? queueManagement : null}
            {selectedTab === "patientRegistration" ? patientRegistration : null}
            {selectedTab === "patientVitals" ? patientVitals : null}
            {selectedTab === "clinicalDetails" ? clinicalDetails : null}
          </div>
         
        </div>

      </div>
    </div>
  );
}
