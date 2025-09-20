"use client"
import { usePatient } from "@/contexts/PatientIdContext";
import { useEffect, useState } from "react"
import { Search } from 'lucide-react';
interface QueueItem{
    patientId:string;
        patientName:string;
        clinicNo:string;
        doctor:string
}
export default function Queue(){
    const {patientId,setPatientId}=usePatient();
    const [Alldata,setAllData]=useState<QueueItem[]>([]);
    const [data,setdata]=useState<QueueItem[]>([]);
    const [selectedQueue,setSelectedQueue]=useState("ALL");
    async function getAllQueue(){
        const res=await fetch("api/queue");
        const Qdata=await res.json();
        setAllData(Qdata);
        setdata(Qdata);
        
    }
      async function getOpdQueue(){
        const res=await fetch("api/queue/opd");
        const Qdata=await res.json();
        setAllData(Qdata);
         setdata(Qdata);
        
    }
      async function getEmergencyQueue(){
        const res=await fetch("api/queue/emergency");
        const Qdata=await res.json();
      
        
        setAllData(Qdata);
        setdata(Qdata);
      
        
    }
    useEffect(()=> {
      if(selectedQueue === "ALL"){
        
getAllQueue();
      }
      else if(selectedQueue === "OPD"){
        getOpdQueue();
      }
      else{
        getEmergencyQueue();
      }
       const interval=setInterval(()=>{
        if(selectedQueue === "ALL"){
getAllQueue();
      }
      else if(selectedQueue === "OPD"){
        getOpdQueue();
      }
      else{
        getEmergencyQueue();
      }
       },5000000)

       return ()=> clearInterval(interval);
    },[selectedQueue])
 
   function filterPatients(input: string) {
    if (!input) {
      setdata(Alldata); // reset to all patients
    } else {
      setdata(
        Alldata.filter((d) =>
          d.patientId.toLowerCase().includes(input.toLowerCase())
        )
      );
    }
  }
    return(
        //delete patient from queue
        <div className="space-y-3 p-2 h-full   border-2 border-black/30   rounded-3xl shadow-2xl   ">
            <div className=" p-2    border-2 border-black/30   rounded-4xl flex items-center "> 
               <button className={` px-4 text-center ${selectedQueue === "ALL"? "bg-green-400 rounded-3xl border-black/30 border-2 ": null} `}  onClick={()=>setSelectedQueue("ALL")}>All</button> 
               <button className={` px-4    text-center ${selectedQueue === "OPD"? "bg-green-400 rounded-3xl border-black/30 border-2 ": null}`}  onClick={()=>setSelectedQueue("OPD")}>OPD</button>
               <button className={` px-4   text-center ${selectedQueue === "Emergency"? "bg-green-400 rounded-3xl border-black/30 border-2 ": null}`}  onClick={()=>setSelectedQueue("Emergency")}>Emergency</button>
            </div> 
            <div  className="flex items-center jsutify-center">
              <div className="bg-gray-200  p-2 rounded-tl-2xl rounded-bl-2xl">
                 <Search className="" />
              </div>
            <input type="text" className="bg-gray-200 p-2 rounded-2xl rounded-bl-none rounded-tl-none w-full"
             onChange={(e)=>{
               filterPatients(e.target.value)
             }}
            placeholder="Enter Patient id " />
            </div>
            <div className=" flex flex-col space-y-4 p-2  border-2 border-black/30  rounded-2xl  ">
                
                {data.map((d:QueueItem,index)=>{
                     return (
                        <div key={`queue-${d.patientId}`}
                         className=" p-4 hover:scale-115 bg-gray-200 transform ease-in-out duration-300 relative  border-1 border-black/30 rounded-2xl    shadow-2xl "
                         onClick={()=>{
                           setPatientId(d.patientId); 
                         }}
                         >
                     <span className="absolute right-4 top-2  h-6 w-6 text-sm  grid place-items-center hover:bg-red-800 cursor-pointer" onClick={(e)=>{
                      e.stopPropagation();
                      console.log("clicked");
                     }}>❌</span>     
                    <p className="text-black  text-center"><strong>Patient Id:</strong> {`${d.patientId}`}</p>
                    <p className="text-black  text-center"><strong>Patient Name:</strong> {`${d.patientName}`}</p>
                    <p className="text-black  text-center"><strong>Clinic No:</strong> {`${d.clinicNo}`}</p>
                    <p className="text-black text-center "><strong>Doctor:</strong> {`${d.doctor}`}</p>
                </div>
                     )
                })

                }
                
                
            </div>
        </div>
    )
}