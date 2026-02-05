import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest){
    try{
        const data=await req.json();
        
        const res= await query('insert into patient(patient_name,age,gender,contact_number,cnic,address) values($1,$2,$3,$4,$5,$6) RETURNING patient_id'
            ,[data.patient_name,parseInt(data.age),data.gender,data.contact_number,data.cnic,data.address]);

            const newPatientId=res.rows[0].patient_id;
         return NextResponse.json({message:"Patient Added Successfully ",patient_id:newPatientId},{status:200});
        
    }catch(err){
        console.error(err);
        return NextResponse.json({error:"failed to post patient data "},{status:500});
    }
}

export async function GET(req:NextRequest){
    try{
        const res=await query('select * from patient');
        return NextResponse.json(res.rows,{status:200});
    }catch(err){
        console.error(err);
        return NextResponse.json({error:"failed to fetch all patients"},{status:500});
    }
}

export async function PATCH(req:NextRequest){
    const data=await req.json();

    return NextResponse.json(data);
}


