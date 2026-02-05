import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest,{params}:{params:{patientId:string}}){
    const id=(await params).patientId;
    const res=await req.json();

    return NextResponse.json(res);


}