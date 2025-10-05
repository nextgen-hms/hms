import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest,{params}:{params:{category:string}}){
     const ctg=(await params).category;

   try {
      const res=await query("select * from medicine where category = $1",[ctg]);
      return NextResponse.json(res.rows);
      
   } catch (err) {
      console.error(err);
      return NextResponse.json({error:"error on category/[category]"})
      
   }
}