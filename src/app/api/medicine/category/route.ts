import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req:NextRequest) {
    try {
        const  res=await query("select distinct category from medicine");
        console.log(res.rows);
        return NextResponse.json(res.rows)
        
    } catch (err) {
         console.error(err);
    }
}