"use client";
import { PatientContextProvider } from "@/contexts/PatientIdContext";
import Image from "next/image";
import { useState } from "react";
import {redirect} from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { logoutUser } from "@/src/features/Login/api";
export default function Pharmacist({
   retail,
   returnMedicine,
   purchase
}: {
    retail:React.ReactNode;
    returnMedicine:React.ReactNode;
    purchase:React.ReactNode;
}) {
  const [selectedTab, setSelectedTab] = useState("purchases");

  return (
    <div className="flex flex-col h-screen w-full "> 
      {/* Clinic Header */}
      <div className=" border-1 border-black/30  flex items-center justify-center">
        <div className="relative h-10 w-10">
         <Image src="/logo.png" alt="Clinic Logo" fill />
       </div>
        <h1 className="text-3xl font-bold text-green-800/80">
          Dr Bablu Clinic
        </h1>
         <Button onClick={async ()=> {
                          await logoutUser()
                          redirect("/")
                          }} className="absolute right-2">Logout</Button>
      </div>
      {/* Receptionist Header */}
      <div className=" border-1  border-black/30  flex items-center justify-center">
        <h1 className="text-2xl p-4 font-bold text-green-800/80">
          Pharmacist's View
        </h1>
      </div>
      {/* container containg  qeue and tabs and their implemntations */}
      <div id="container-containing-queue-and-tabs" className="flex  space-x-4  w-full flex-1">
        <PatientContextProvider>         
           {/* div containing tabs and their implemetations */}
          <div   className=" p-2 rounded-2xl border-black/30 border-2 flex flex-1 flex-col h-full  w-full"> 
              <div id="tab" className=" w-[60%]  p-2 border-2 border-black/30    rounded-4xl flex items-center gap-2 bg-gray-300 ">
                <button className={`  px-4    text-center ${selectedTab === "retail" ? "bg-green-400 rounded-3xl border-black/30 border-2": null}`}
                    onClick={()=> setSelectedTab("retail")}
                >
                  Retail
                </button>
                <button className={` px-4      text-center  ${selectedTab === "returnMedicine" ? "bg-green-400 rounded-3xl border-black/30 border-2": null}`}
                   onClick={()=> setSelectedTab("returnMedicine")}
                >
                  Return Medicine
                </button>
                <button className={` px-4     text-center  ${selectedTab === "purchases" ? "bg-green-400 rounded-3xl border-black/30 border-2": null}`}
                  onClick={()=> setSelectedTab("purchases")}
                >
                  Purchases
                </button>
                <button className={` px-4     text-center  ${selectedTab === "ledger" ? "bg-green-400 rounded-3xl border-black/30 border-2": null}`}
                onClick={()=> setSelectedTab("ledger")}
                >
                 Ledger
                </button>
                <button className={` px-4     text-center  ${selectedTab === "addParty" ? "bg-green-400 rounded-3xl border-black/30 border-2": null}`}
                onClick={()=> setSelectedTab("addParty")}
                >
                  Add Party
                </button>
                 <button className={` px-4     text-center  ${selectedTab === "purchaseReturn" ? "bg-green-400 rounded-3xl border-black/30 border-2": null}`}
                onClick={()=> setSelectedTab("purchaseReturn")}
                >
                  Purchase Return
                </button>
              </div>

              <div id="tab-paralell-routes " className=" h-full w-full">
                {selectedTab === "retail" ? retail : null}
                {selectedTab === "returnMedicine" ?  returnMedicine : null}
                 {selectedTab === "purchases" ?  purchase : null}
              </div>
            
          </div>
          
          
        </PatientContextProvider>
         
      </div>
      
    </div>
  );
}
