//Next steps 
//creagte purchase medicine api
//make sure to deal  with alll edge cases
//like expiiry date - stock update - price update



///DB UPDATES
///add some table to cater medicines from different batches



//issues
//right  now i am using input woth dat list ---> later i have to fix it with new input search
//


"use client"
import {z} from 'zod';
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Label } from "@/src/components/ui/Label";
import { useEffect, useRef, useState } from "react";
import { getAllMedicines, getAllPartiesName } from "../api";
import { Medicine, Party, PurchaseForm } from "../types";
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
    const [medicines,setMedicines]=useState<Medicine[]>([]);
    const [filteredMedicines,setFilteredMedicines]=useState<Medicine[]>([]);
    const [showParties,setShowParties]=useState(false);
    const [showMedicines,setShowMedicines]=useState(false);
    const [highlightIndex,SetHighlightIndex]=useState(0);
    const isFirstRender=useRef(true);
    const inputRef=useRef(null);
    const {
        register,
        handleSubmit,
        formState:{errors},
        setValue,
        watch
    }=useForm({
        resolver:zodResolver(PurchaseSchema) ///zod.infer X
    }
    );

  

useEffect(()=>{
    async function LoadPartiesNames(){
        const data= await getAllPartiesName();
        setParties(data);
        setFilterParties(data);
    }
    LoadPartiesNames();
},[]);

useEffect(()=>{
    async function LoadMedicines(){
        const data=await getAllMedicines();
        setMedicines(data);
        setFilteredMedicines(data);
    }
    LoadMedicines();
},[]);

 function onSubmit(data:PurchaseForm){
     console.log(data);
     
       
 }


    return(
            <form onSubmit={handleSubmit(onSubmit)}>
        <div className="border-1 h-1/2 w-3/5 grid grid-cols-2 grid-rows-6 ">
            <div id="Select(Add) Party " className="flex w-full  gap-4 flex-1 justify-between ">
                <div id="Select Party" className="w-4/5 relative ">
                <Label>Party :</Label>
                {/* <select {...register("party")}
                        className=''
                >
                    <option value="">Select a Party</option>
                    {parties.map((party,index)=>(
                        <option>{party.name}</option>
                    ))}
                </select> */}
                <Input
                 {...register("party")}
                 list='party-list'
                 className=''
                />
                <datalist id='party-list' className=''>
                    {parties.map((party,index)=>(
                        <option key={party.party_id} >{party.name}   </option>
                    ))}
                </datalist>
                
                <p className='text-red-500 text-sm h-5'>{errors.party?.message}</p> 
                </div>
            </div>
            <div className="flex items-end">
                <Button className="h-fit flex ">Add Party</Button>
            </div>
            <div id="Select(Add) Medicine " className="flex items-end gap-4 flex-1 justify-between">
                <div id="Select Medicine" className="w-4/5 relative">
                <Label>Medicine :</Label>
                {/* <Input {...register("medicine")}
                     placeholder="Select Medicine"
                      className=""
                      onFocus={()=>setShowMedicines(true)}
                      onBlur={()=>setShowMedicines(false)}
                      onKeyDown={(e)=>{
                        if(!showMedicines) return;
     
                        if(e.key === "ArrowDown"){
                            e.preventDefault();
                          SetHighlightIndex((prev)=>{
                            if(prev +1 < filteredMedicines.length){
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
                                setValue("medicine",
                                    filteredMedicines[highlightIndex].brand_name+" "+filteredMedicines[highlightIndex].dosage_value+filteredMedicines[highlightIndex].dosage_unit, { shouldValidate: true });
                                SetHighlightIndex(-1);
                                setShowMedicines(false);
                            }
                        }
                     }}
                      /> */}
                    <Input
                 {...register("medicine")}
                 list='med-list'
                 className=''
                />
                <datalist id='med-list' className=''>
                    {medicines.map((medicine,index)=>(
                        <option key={medicine.medicine_id} >{medicine.brand_name}  {medicine.dosage_value}{medicine.dosage_unit} {medicine.stock_quantity}  </option>
                    ))}
                </datalist>
                <div className={`absolute bg-white w-full ${showMedicines ? "h-[480px]" : ""} overflow-y-auto`}>
                    { showMedicines && (filteredMedicines.map((medicine:Medicine,index)=>{
                        return(
                        <div key={medicine.medicine_id}
                             className={`border-1 p-1 hover:bg-emerald-200 ${highlightIndex === index ?
                                "bg-emerald-200" : ""}  cursor-pointer rounded-md`}
                             onMouseDown={(e)=>{
                                e.preventDefault();
                                setValue("medicine",filteredMedicines[index].brand_name, { shouldValidate: true });
                                SetHighlightIndex(-1);
                                setShowMedicines(false);
                             }}
                        >
                            {medicine.brand_name} {medicine.dosage_value}{medicine.dosage_unit}
                        </div>
                    )})
                    )

                    }
                </div>
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