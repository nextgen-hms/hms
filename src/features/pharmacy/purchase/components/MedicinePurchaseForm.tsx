"use client"
import {z} from 'zod';
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Label } from "@/src/components/ui/Label";
import { useEffect, useState } from "react";
import { getAllPartiesName } from "../api";
import { Party, PurchaseForm } from "../types";
import { useForm } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
const PurchaseSchema=z.object({
    party:z.string().min(1,"Please Select a Party"),
    medicine:z.string().min(1,"Please Select a Medicine"),
    quantity:z.number().min(1,"Please Enter Quantity"),
    sub_quantity:z.number().min(0,"Please Enter Sub Quantity"),
    unit_cost:z.number().min(0,"Please Enter Unit Cost"),
    sub_unit_cost:z.number().min(0,"Please Enter Sub Unit Cost"),
    expiry_date:z.string().min(1,"Expiry Date is Required"),
    batch_number:z.number().min(1,"Batch Number is Required")
})


export default function MedicinePurchase (){
    const [parties,setParties]=useState<Party[]>([]);
    const [filterParties,setFilterParties]=useState<Party[]>([]);
    const [showParties,setShowParties]=useState(false);
    const [highlightIndex,SetHighlightIndex]=useState(0);
    const {
        register,
        handleSubmit,
        formState:{errors},
        setValue,
        watch
    }=useForm({
        resolver:zodResolver(PurchaseSchema)
    }
    );
    const partyValue=watch("party");
    useEffect(()=>{
        if(partyValue === ""){
            setShowParties(true);
        }
     setFilterParties(parties.filter((p)=>p.name.toLowerCase().includes(partyValue.toLowerCase())))
    },[partyValue])

useEffect(()=>{
    async function LoadPartiesNames(){
        const data= await getAllPartiesName();
        setParties(data);
        setFilterParties(data);
    }
    LoadPartiesNames();
},[]);

 function onSubmit(data:PurchaseForm){
     console.log(data);
     
       
 }


    return(
            <form onSubmit={handleSubmit(onSubmit)}>
        <div className="border-1 h-1/2 w-3/5 grid grid-cols-2 grid-rows-6 ">
            <div id="Select(Add) Party " className="flex  gap-4 flex-1 justify-between ">
                <div id="Select Party" className="w-4/5 relative ">
                <Label>Party :</Label>
                <div className='parties input select'>
                <Input {...register("party")}  placeholder="Select The Party" className=""
                 onFocus={()=>setShowParties(true)}
                 onBlur={()=>setShowParties(false)}
                 onKeyDown={(e)=>{
                    if(!showParties) return;
 
                    if(e.key === "ArrowDown"){
                        e.preventDefault();
                      SetHighlightIndex((prev)=>{
                        if(prev +1 < parties.length){
                            prev=prev+1;
                        }
                        return prev;
                      })
                    }
                    if(e.key === "ArrowUp"){
                        e.preventDefault();
                        SetHighlightIndex((prev)=>{                            
                            if(prev > 0){
                                prev=prev-1;
                            }
                            return prev;
                        })
                    }
                    if(e.key === "Enter"){
                        e.preventDefault();
                        if(highlightIndex >=0){
                            setValue("party",filterParties[highlightIndex].name);
                            SetHighlightIndex(-1);
                            setShowParties(false);
                        }
                    }
                 }}
                 />
                <div className="absolute bg-white w-full  ">
                    {showParties &&  (filterParties.map((party:Party,index)=>{
                        return(
                            <div key={party.party_id}  
                            className={`border-1 p-1 hover:bg-emerald-200 ${highlightIndex === index ?   "bg-emerald-200" : ""}  cursor-pointer rounded-md`}
                            onMouseDown={(e)=>{
                                e.preventDefault()
                                setValue("party",filterParties[index].name)
                                setShowParties(false);
                            }}
                            >
                                 {party.name}
                            </div>
                        )
                    }))}
                </div>
                </div>
                <p className='text-red-500 text-sm h-5'>{errors.party?.message}</p> 
                </div>
            </div>
            <div className="flex items-end">
                <Button className="h-fit flex ">Add Party</Button>
            </div>
            <div id="Select(Add) Medicine " className="flex items-end gap-4 flex-1 justify-between">
                <div id="Select Medicine" className="w-4/5">
                <Label>Medicine :</Label>
                <Input {...register("medicine")} placeholder="Select Medicine" className=""/>
                    <p className='text-red-500 text-sm h-5'>{errors.medicine?.message}</p>
                </div>
            </div>
            <div className="flex items-end">
                <Button className="h-fit  ">Add Medicine</Button>
            </div>
            <div id="quantity" className="flex items-end gap-4 flex-1 justify-between">
                <div id="quantity" className="w-4/5">
                <Label>Quantity :</Label>
                <Input {...register("quantity",{valueAsNumber:true})} placeholder="Enter Quantity" className="" type='number'/>
                    <p className='text-red-500 text-sm h-5'>{errors.quantity?.message}</p>
                </div>
            </div>
            <div id="sub_quantity" className="flex items-end gap-4 flex-1 justify-between">
                <div id="sub_quantity" className="w-4/5">
                <Label>Sub Quantity :</Label>
                <Input {...register("sub_quantity",{valueAsNumber:true})} placeholder="Enter Sub Quantity" className="" type='number'/>
                    <p className='text-red-500 text-sm h-5'>{errors.sub_quantity?.message}</p>
                </div>
            </div>
            <div id="unit_cost" className="flex items-end gap-4 flex-1 justify-between">
                <div id="unit_cost" className="w-4/5">
                <Label>unit Cost :</Label>
                <Input {...register("unit_cost",{valueAsNumber:true})} placeholder="Enter Unit Cost" className="" type='number'/>
                    <p className='text-red-500 text-sm h-5'>{errors.unit_cost?.message}</p>
                </div>
            </div>
            <div id="sub_unit_cost" className="flex items-end gap-4 flex-1 justify-between">
                <div id="unit_cost" className="w-4/5">
                <Label>Sub unit Cost :</Label>
                <Input {...register("sub_unit_cost",{valueAsNumber:true})} placeholder="Enter Sub Unit Cost" className="" type='number'/>
                    <p className='text-red-500 text-sm h-5'>{errors.sub_unit_cost?.message}</p>
                </div>
            </div>
            <div id="expiry-date" className="flex items-end gap-4 flex-1 justify-between">
                <div id="expiry-date" className="w-4/5">
                <Label>Expiry Date :</Label>
                <Input {...register("expiry_date")} placeholder="Expiry Date"  type="Date"  className="" />
                    <p className='text-red-500 text-sm h-5'>{errors.expiry_date?.message}</p>
                </div>
            </div>
            <div id="batch-number" className="flex items-end gap-4 flex-1 justify-between">
                <div id="batch-number" className="w-4/5">
                <Label>Batch Number :</Label>
                <Input {...register("batch_number",{valueAsNumber:true})} placeholder="Enter Batch Number" className="" type='number'/>
                    <p className='text-red-500 text-sm h-5'>{errors.batch_number?.message}</p>
                </div>
            </div>
            <div className="flex items-center ml-4 mt-4 col-span-2">
             <Button type='submit' className="w-1/4 h-fit  ">Submit</Button>
            </div>
        </div>
            </form>
    )
}