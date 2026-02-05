import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest){
    try{

        const res=await query('select doctor_id,doctor_name from doctor;');
        return NextResponse.json(res.rows,{status:200})
    }catch(err){
        console.error(err);
        return NextResponse.json({error:"failed to fetch docotors list"})
    }
}