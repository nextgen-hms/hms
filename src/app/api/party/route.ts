import { NextRequest,NextResponse } from "next/server";
import {query} from '@/database/db'

export async function GET(req:NextRequest) {
    
    //fetch patient party from db
    try{

        const data=await query('select * from party ');
        
        return NextResponse.json(data.rows);

        
    }catch(err){
        console.error(err);
        return NextResponse.json({error:"something went wrong"},{status:500});
    }
    
    
}