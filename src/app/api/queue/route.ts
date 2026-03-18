import { query } from "@/database/db";
import { NextResponse } from "next/server";

export async function GET(){
 //will get info from visit and ppatient table 
try{
    const data=await query("select p.patient_id,v.visit_id,p.patient_name,v.clinic_number,d.doctor_name,d.doctor_id,v.visit_type,v.status from visit v join doctor d on v.doctor_id=d.doctor_id join patient p on v.patient_id=p.patient_id where v.visit_timestamp > current_date and v.visit_timestamp < current_date  + interval '1 day' and v.is_deleted = false order by v.visit_timestamp desc" );

    return NextResponse.json(data.rows,{status:200})
}catch(err){
   console.error(err);
   return NextResponse.json({error:"failed to fetch queue"})
}
}
