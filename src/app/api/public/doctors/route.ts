import { query } from "@/database/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await query('SELECT doctor_id, doctor_name FROM doctor ORDER BY doctor_name ASC;');
    return NextResponse.json(res.rows, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch doctors list" }, { status: 500 });
  }
}
