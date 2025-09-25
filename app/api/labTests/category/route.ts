import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest
) {
  
 try {
  const res=await query("select distinct category from lab_test;");
  return NextResponse.json(res.rows);
  
 } catch (error) {
  console.error(error);
  return NextResponse.json({error:error},{status:500})
  
 }
  
}
