import { query } from "@/database/db";
import { NextRequest,NextResponse } from "next/server";

export async function GET(){
 //will get info from visit and ppatient table 
try{
    const data=await query("select p.patient_id,p.patient_name,v.clinic_number,d.doctor_name,d.doctor_id,visit_type from visit v join doctor d on v.doctor_id=d.doctor_id join patient p on v.patient_id=p.patient_id where v.visit_timestamp > current_date and v.visit_timestamp < current_date  + interval '1 day' and is_deleted = false" );

    return NextResponse.json(data.rows,{status:200})
}catch(err){
   console.error(err);
   return NextResponse.json({error:"failed to fetch queue"})
}
}
