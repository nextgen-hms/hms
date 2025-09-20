


import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";



export async function PATCH(req:NextRequest){
      const res= await req.json();
   console.log(res);
   try{
const v_res=await query('update visit set doctor_id = $2, visit_type=$3,clinic_number=$4,status =$5,reason=$6 where patient_id = $1 returning *',[res.patient_id,res.doctor_id,res.visit_type,res.clinic_number,res.status,res.reason]);
   
    console.log(res.rows);
    
   return NextResponse.json(v_res.rows[0]);
   }catch(err){
      console.error(err);
      return NextResponse.json({error:"failed to update visist"},{status:500});
   }
}

export async function POST(req:NextRequest){
   const res= await req.json();
   console.log(res);
   try{
const v_res=await query('insert into visit(patient_id,doctor_id,visit_type,clinic_number,status,reason) values($1,$2,$3,$4,$5,$6);',[res.patient_id,res.doctor_id,res.visit_type,res.clinic_number,"waiting",res.reason]);
   
    console.log(res.rows);
    
   return NextResponse.json(v_res.rows[0]);
   }catch(err){
      console.error(err);
      return NextResponse.json(err);
   }
  
    
}