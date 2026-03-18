import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";


export  async function GET(req:NextRequest,{params}:{params:Promise<{patientId:string}>}){

    const visitId=(await params).patientId;
   
    try{
      const res=await query("select * from current_pregnancy where visit_id = $1",[visitId]);
      if(res.rows.length > 0){
        return NextResponse.json(res.rows[0],{status:200});
      }
      else{
        return NextResponse.json({error:"no record found for visit"},{status:404})
      }
    }catch(err){
      console.error(err);
      return NextResponse.json({errror:"failed to get record form d"},{status:500})
    }
}
