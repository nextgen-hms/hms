import { NextRequest,NextResponse } from "next/server";
import {query} from '@/database/db'

export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}) {
    const pid=(await params).id;
    //fetch patient details from db
    try{

        const data=await query('select * from patient where patient_id = $1',[pid]);
        
        return NextResponse.json(data.rows[0]);

        
    }catch(err){
        console.error(err);
        return NextResponse.json({error:"something went wrong"},{status:500});
    }
    
    
}