import pool from "@/database/db";
import { NextRequest,NextResponse } from "next/server";

export async function GET(req:NextRequest,{params}:{params:Promise<{userCode:string}>}){
   const code=(await params).userCode.toUpperCase();

   const client=await pool.connect();
  try{
   let res;
   if(code.includes("DOC")){
    res=await client.query("select doctor_name as name,'Doctor' as role from doctor where user_code = $1 ",[code]);
   }
    else{
    res=await client.query("select name ,role from staff where user_code = $1 ",[code]);
   }
   
   if(res!.rows.length === 0){
      throw new Error("No user Found");
   }
   return NextResponse.json(res!.rows[0],{status:200})
  }
  catch(err){
   console.error(err);
   return NextResponse.json({error:err},{status:500});
  }
  finally{
   client.release();
  }
}