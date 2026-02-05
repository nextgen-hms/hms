import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";


export  async function GET(req:NextRequest,{params}:{params:Promise<{patientId:string}>}){

    const pid=(await params).patientId;
   console.log(pid);
   
    try{
      const res=await query("select * from menstrual_history where patient_id = $1",[pid]);
      if(res.rows.length > 0){
        return NextResponse.json(res.rows[0],{status:200});
      }
      else{
        return NextResponse.json({error:"no record found for patient"},{status:400})
      }
    }catch(err){
      console.error(err);
      return NextResponse.json({errror:"failed to get record form d"})
    }
}