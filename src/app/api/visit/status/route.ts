import { NextRequest, NextResponse } from "next/server";
import {query} from "@/database/db"
///there is  a procedure which are doing work of /visisttStatus History and /Status 



export async function PATCH(req:NextRequest){
    const data=await req.json();
    try {
        const res=await query("update visit set status = $1 where visit_id = $2 returning *",[data.status,data.visit_id]);
        if(res.rows.length < 0){
            return NextResponse.json({message:"no patient found for that visist id"},{status:400})
        }
        else{
            return NextResponse.json({data:res.rows[0]},{status:200})
        }
        
    } catch (err) {
        console.error(err);
        return NextResponse.json({error:"DB error on Visit/Status Patch "},{status:500})
    }
}