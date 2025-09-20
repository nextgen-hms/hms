import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest){
     const data=await req.json();
     console.log(data);
     try{
          const res=await query("insert into menstrual_history(patient_id,menarch_age,cycle_length_days,bleeding_days,menstrual_regular,contraception_history,gynecologic_surgeries,medical_conditions,menopause_status,notes) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning *",[data.patient_id,data.menarch_age,data.cycle_length_days,data.bleeding_days,data.menstrual_regular,data.contraception_history,data.gynecologic_surgeries,data.medical_conditions,data.menopause_status,data.notes]);
           
          return NextResponse.json({data:res.rows},{status:200})
     }catch(err){
          console.error(err);
          return NextResponse.json(err,{status:500})
     }
     
}


export  async function PATCH(req:NextRequest){
       const data=await req.json();
     console.log(data);
     try{
          const res=await query("update menstrual_history set menarch_age=$2,cycle_length_days=$3,bleeding_days=$4,menstrual_regular=$5,contraception_history=$6,gynecologic_surgeries=$7,medical_conditions=$8,menopause_status=$9,notes=$10 where patient_id=$1 returning *",[data.patient_id,data.menarch_age,data.cycle_length_days,data.bleeding_days,data.menstrual_regular,data.contraception_history,data.gynecologic_surgeries,data.medical_conditions,data.menopause_status,data.notes]);
          
          return NextResponse.json({data:res.rows},{status:200})
     }catch(err){
          console.error(err);
          return NextResponse.json(err,{status:500})
     }
}