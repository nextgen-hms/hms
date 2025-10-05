import { NextRequest, NextResponse } from "next/server";
import {query} from '@/database/db';


export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){
    const id=(await params).id;

   try{
    const res=await query("select visit_id  from visit where patient_id = $1 and (visit_timestamp > current_date and visit_timestamp < current_date + interval '1 day');",[id] );
    console.log(res.rows);

     const v_visit_id=res.rows[0]?.visit_id
     if(!v_visit_id) {
      return NextResponse.json({error:"add patient in queue first"},{status:400})
     }
     const p_res= await query("select * from patient_vitals where  visit_id = $1",[v_visit_id]);     
    
     if(p_res.rows[0]){

      return NextResponse.json(p_res.rows[0])
    }
    return NextResponse.json({error:"no vitals found backend"},{status:400})

   }catch(err){
     console.error(err);
     return NextResponse.json({error:"failed to get patient vitals"},{status:500})
   }
}