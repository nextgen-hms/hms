import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const visitType = searchParams.get('visitType') || 'OPD';

        const clinicNo = await query('select get_clinic_number($1) as "clinicNo"', [visitType]);
        return NextResponse.json(clinicNo.rows[0], { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "unable to get clinic no " }, { status: 500 })
    }

}