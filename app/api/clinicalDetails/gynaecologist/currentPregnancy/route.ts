import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest){
     const data=await req.json();
     console.log(data);
     try{
          const res=await query("insert into current_pregnancy(patient_id,visit_id,multiple_pregnancy,complications,ultrasound_findings,fetal_heart_rate_bpm,placenta_position,presentation,gestational_age_weeks,notes) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning *",[data.patient_id,data.visit_id,data.multiple_pregnancy,data.complications,data.ultrasound_findings,data.fetal_heart_rate_bpm,data.placenta_position,data.presentation,data.gestational_age_weeks,data.notes]);
          console.log(res);
          
          if(res.rows.length >0){

                return NextResponse.json({data:res.rows},{status:200})
           }
           else{
               return NextResponse.json({data:res},{status:400})
           }
     }catch(err){
          console.error(err);
          return NextResponse.json(err,{status:500})
     }
     
}


export  async function PATCH(req:NextRequest){
       const data=await req.json();
     console.log(data);
     try{
          const res=await query("update current_pregnancy set multiple_pregnancy=$2,complications=$3,ultrasound_findings=$4,fetal_heart_rate_bpm=$5,placenta_position=$6,presentation=$7,gestational_age_weeks=$8,notes=$9 where patient_id=$1 returning *",[parseInt(data.patient_id),data.multiple_pregnancy,data.complications,data.ultrasound_findings,data.fetal_heart_rate_bpm,data.placenta_position,data.presentation,data.gestational_age_weeks,data.notes]);
          
          return NextResponse.json({data:res.rows},{status:200})
     }catch(err){
          console.error(err);
          return NextResponse.json(err,{status:500})
     }
}