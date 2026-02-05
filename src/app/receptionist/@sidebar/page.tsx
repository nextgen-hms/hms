"use client"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ClinicalDetailsProvider } from "@/contexts/ClinicalDetailsContext"
import { useSidebar } from "@/contexts/SidebarContext"

export default function Page() {
   const {activeTab,setActiveTab}=useSidebar();
       
  return (
    <div className=" p-2 rounded-2xl border-black/30 flex   w-full h-full">
          <div
            id="tab"
            className=" w-[16%]  p-2 border-2 border-black/30    rounded-4xl flex items-center  bg-gray-300 "
          >
            <button
              className={`  px-4    text-center ${
                activeTab === "queue"
                  ? "bg-green-400 rounded-3xl border-black/30 border-2"
                  : null
              }`}
              onClick={() => setActiveTab("queue")}
            >
              Queue Mangement
            </button>
            <button
              className={` px-4      text-center  ${
                activeTab === "patientRegistration"
                  ? "bg-green-400 rounded-3xl border-black/30 border-2"
                  : null
              }`}
              onClick={() => setActiveTab("patientRegistration")}
            >
              Patient Registration
            </button>
            <button
              className={` px-4     text-center  ${
               activeTab === "patientVitals"
                  ? "bg-green-400 rounded-3xl border-black/30 border-2"
                  : null
              }`}
              onClick={() => setActiveTab("patientVitals")}
            >
              Patient Vitals
            </button>
            <button
              className={` px-4     text-center  ${
                activeTab === "clinicalDetails"
                  ? "bg-green-400 rounded-3xl border-black/30 border-2"
                  : null
              }`}
              onClick={() => setActiveTab("clinicalDetails")}
            >
              Clinical Details
            </button>
          


          </div>

          <div id="tab-paralell-routes" className="relative w-[90%] ">
            <div className="absolute top-2  left-50">
            
            </div>
            {/* {selectedTab === "queue" ? queueManagement : null}
            {selectedTab === "patientRegistration" ? patientRegistration : null}
            {selectedTab === "patientVitals" ? patientVitals : null}
            {selectedTab === "clinicalDetails" ? clinicalDetails : null} */}
          </div>
         
        </div> 
  )
}
