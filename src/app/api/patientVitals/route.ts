import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest){
    const data=await req.json();
    try{
     if(!data.visit_id){
        return NextResponse.json({error:"visit_id is required"},{status:400})
     }
       const p_res=await query("insert into patient_vitals(visit_id,blood_pressure,heart_rate,temperature,weight,height,blood_group)  values($1,$2,$3,$4,$5,$6,$7) returning *",[data.visit_id,data.blood_pressure,data.heart_rate,data.temperature,data.weight,data.height,data.blood_group])
        return NextResponse.json(p_res.rows[0])

    }catch(err){
        console.error(err);
        return NextResponse.json({error:"failed to add patient vitals",detail:String(err)},{status:500})
    }
    
}


export async function PATCH(req:NextRequest){
     const data=await req.json();
    try{
     if(!data.visit_id){
        return NextResponse.json({error:"visit_id is required"},{status:400})
     }
       const p_res=await query("update patient_vitals set blood_pressure=$1,heart_rate=$2,temperature=$3,weight=$4,height=$5,blood_group=$6 where visit_id = $7 returning *",[data.blood_pressure,data.heart_rate,data.temperature,data.weight,data.height,data.blood_group,data.visit_id])
       if (p_res.rows.length === 0) {
        return NextResponse.json({error:"patient vitals not found"},{status:404})
       }
        return NextResponse.json(p_res.rows[0])

    }catch(err){
        console.error(err);
        return NextResponse.json({error:"faied to update patient vitals"},{status:500})
    }
}
