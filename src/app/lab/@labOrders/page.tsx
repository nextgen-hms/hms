"use client"
import {useEffect, useState} from "react"
//here lab technicinan can see the reports prescried by doctor and can upload the results of  it .
type  LabOrders ={
    visit_id:string;
    order_id:string;
    test_id:string;
    test_name:string;
    category:string;
    price:string;
    description:string;
    status:string;
    ordered_by:string;
    performed_by:string;
    order_date:string
}


import { usePatient } from "@/contexts/PatientIdContext"
import toast from "react-hot-toast";

export default function LabOrders(){
    const {patientId,setPatientId} =usePatient();
    const [pId,setpId]=useState("");
    const [LabOrders,setLabOrders]=useState([]);
    const [filter,setFilter]=useState("All");
    const [filteredOrders,setFilteredOrders]=useState([]);
    async function getLaborders(){
        if(!patientId) return;
        const res= await fetch(`api/labTests/${pId}`);
        if(res.ok){
            const data=await res.json();
            console.log(data);
            
            setLabOrders(data);
            setFilteredOrders(data);
            toast.success("Lab oredrs for patient fetched successfully");
        }
        else{
            toast.error("failed to fetch lab orders for patient")
        }
    }
    useEffect(()=>{
        getLaborders();
    },[])
   function filterOrders(){
      if(filter === "Today"){
        const today = new Date().toISOString().split("T")[0];
        
         setFilteredOrders(filteredOrders.filter((d:LabOrders)=> d.order_date.split("T")[0] === today))
      }
   }
   useEffect(()=>{
     filterOrders();
   },[filter])
    return(
        <div>
            <div className="flex flex-col w-1/5">
                <label htmlFor="patientId" className="text-sm px-2 p-1">Patient Id</label>
                <input type="text" id="patientId" 
                className="bg-gray-200 p-2  rounded-2xl"
                placeholder="Enter Existing Patient Id"
                value={pId} 
                onChange={(e)=> setpId(e.target.value)}
                onKeyDown={(e)=>{
                if(e.key === "Enter"){
                        setPatientId(pId);
                        getLaborders();
                    }
                  }}
                />
            </div>
            <div className="my-4">
            <h3 className="text-4xl font-semibold text-black/50 p-2 inline ">Lab Orders</h3>
            <select className="border p-2 bg-gray-200 w-1/6 ml-6 rounded-2xl" value={filter}   >
                <option value="All" >All Tests</option>
                <option value="Today">Ordered Today</option>
            </select>
            </div>
        <table className="border border-gray-300 w-full text-left">
            <thead>
               <tr>
                <th className="border px-2 py-1 ">Order Date</th>
                <th className="border px-2 py-1 ">Category</th>
                <th className="border px-2 py-1 ">Test Name</th>
                <th className="border px-2 py-1 " >Ordered By</th>
                <th className="border px-2 py-1 ">Performed By</th>
                <th className="border px-2 py-1 ">Edit</th>
                <th className="border px-2 py-1 ">Results</th>
               </tr>
            </thead>
            <tbody>
                {filteredOrders.map((d:LabOrders)=>(
                    <tr className="hover:bg-gray-500">
                        <td className="border px-2 py-1">{d.order_date}</td>
                        <td className="border px-2 py-1">{d.category}</td>
                        <td className="border px-2 py-1">{d.test_name}</td>
                        <td className="border px-2 py-1">{d.ordered_by}</td>
                        <td className="border px-2 py-1">{d.performed_by}</td>
                        <td className="border px-2 py-1"> Edit</td>
                        <td className="border px-2 py-1"> Add Results</td>
                    </tr>
                ))
                    
                }
            </tbody>
        </table>
        </div>
    )
}