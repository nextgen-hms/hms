import { query } from "@/database/db";
import { NextResponse } from "next/server";



export async function GET() {
    try {
        const  res=await query(`
            SELECT name AS category
            FROM medicine_category
            WHERE is_active = true
            ORDER BY name ASC
        `);
        return NextResponse.json(res.rows)
        
    } catch (err) {
         console.error(err);
         return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}
