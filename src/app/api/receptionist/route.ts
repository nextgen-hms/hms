import { NextRequest, NextResponse } from "next/server";



export async function POST(req:NextRequest){
   const res= await req.json;
   console.log(res);
    
   return NextResponse.json({messasge:"ok"});
}