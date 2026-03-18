import { NextRequest, NextResponse } from "next/server";
import {query} from '@/database/db';


export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){
    const id=(await params).id;

   try{
     const p_res= await query("select * from patient_vitals where visit_id = $1",[id]);     
    
     if(p_res.rows[0]){

      return NextResponse.json(p_res.rows[0])
    }
    return NextResponse.json({error:"no vitals found backend"},{status:404})

   }catch(err){
     console.error(err);
     return NextResponse.json({error:"failed to get patient vitals"},{status:500})
   }
}
