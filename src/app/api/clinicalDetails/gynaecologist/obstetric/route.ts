import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest){
     const data=await req.json();
     console.log(data);
     try{
          const res=await query("insert into obstetric_history(patient_id,is_first_pregnancy,married_years,gravida,para,abortions,edd,last_menstrual_cycle,notes) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning *",[data.patient_id,data.is_first_pregnancy,data.married_years,data.gravida,data.para,data.abortions,data.edd,data.last_menstrual_cycle,data.notes]);
           
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
          const res=await query("update obstetric_history set is_first_pregnancy=$2,married_years=$3,gravida=$4,para=$5,abortions=$6,edd=$7,last_menstrual_cycle=$8,notes=$9 where  patient_id=$1 returning *",[data.patient_id,data.is_first_pregnancy,data.married_years,data.gravida,data.para,data.abortions,data.edd,data.last_menstrual_cycle,data.notes]);
          
          return NextResponse.json({data:res.rows},{status:200})
     }catch(err){
          console.error(err);
          return NextResponse.json(err,{status:500})
     }
}