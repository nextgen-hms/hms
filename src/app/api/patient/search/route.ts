import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const searchTerm = searchParams.get("q");

        if (!searchTerm) {
            return NextResponse.json({ error: "Search term required" }, { status: 400 });
        }

        const res = await query(
            `SELECT patient_id, patient_name, age, gender, cnic, contact_number 
       FROM patient 
       WHERE patient_name ILIKE $1 OR cnic ILIKE $1 
       LIMIT 10`,
            [`%${searchTerm}%`]
        );

        return NextResponse.json(res.rows, { status: 200 });
    } catch (err) {
        console.error("Search API Error:", err);
        return NextResponse.json({ error: "Failed to search patients" }, { status: 500 });
    }
}
