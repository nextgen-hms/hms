import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    //will get info from visit and ppatient table 
    //return patients with opd only
    const data = [{
        patientId: "1",
        patientName: "saad",
        clinicNo: "1",
        doctor: "Fouzia Ishaq"
    }
    ];
    return NextResponse.json(data, { status: 200 })
}
