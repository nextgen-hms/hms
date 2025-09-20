import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest){
    try{
        
        const clinicNo=await query('select get_clinic_number() as "clinicNo"');
        return NextResponse.json(clinicNo.rows[0],{status:200});
    }catch(err){
        console.error(err);
        return NextResponse.json({error:"unable to get clinic no "},{status:500})
    }
    
}