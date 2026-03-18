import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest){
     const data=await req.json();
     try{
          if (!data.visit_id) {
            return NextResponse.json({ error: "visit_id is required" }, { status: 400 });
          }
          const res=await query("insert into current_pregnancy(patient_id,visit_id,multiple_pregnancy,complications,ultrasound_findings,fetal_heart_rate_bpm,placenta_position,presentation,gestational_age_weeks,notes) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning *",[data.patient_id,data.visit_id,data.multiple_pregnancy,data.complications,data.ultrasound_findings,data.fetal_heart_rate_bpm,data.placenta_position,data.presentation,data.gestational_age_weeks,data.notes]);
          if(res.rows.length >0){

                return NextResponse.json({data:res.rows[0]},{status:200})
           }
           else{
               return NextResponse.json({data:res},{status:400})
           }
     }catch(err){
          console.error(err);
          return NextResponse.json({ error: "failed to create current pregnancy", detail: String(err) },{status:500})
     }
     
}


export  async function PATCH(req:NextRequest){
       const data=await req.json();
     try{
          if (!data.visit_id) {
            return NextResponse.json({ error: "visit_id is required" }, { status: 400 });
          }
          const res=await query("update current_pregnancy set patient_id=$2,multiple_pregnancy=$3,complications=$4,ultrasound_findings=$5,fetal_heart_rate_bpm=$6,placenta_position=$7,presentation=$8,gestational_age_weeks=$9,notes=$10 where visit_id=$1 returning *",[data.visit_id,parseInt(data.patient_id),data.multiple_pregnancy,data.complications,data.ultrasound_findings,data.fetal_heart_rate_bpm,data.placenta_position,data.presentation,data.gestational_age_weeks,data.notes]);
          if (res.rows.length === 0) {
            return NextResponse.json({ error: "current pregnancy record not found" }, { status: 404 });
          }
          return NextResponse.json({data:res.rows[0]},{status:200})
     }catch(err){
          console.error(err);
          return NextResponse.json({ error: "failed to update current pregnancy", detail: String(err) },{status:500})
     }
}
