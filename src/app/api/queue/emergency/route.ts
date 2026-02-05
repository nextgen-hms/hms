import { NextRequest,NextResponse } from "next/server";

export async function GET(){
 //will get info from visit and ppatient table 
    const data=[
    {
        patientId:"2",
        patientName:"Bablu",
        clinicNo:"2",
        doctor:"Dr Saad"
    },
     {
        patientId:"3",
        patientName:"Dablu",
        clinicNo:"3",
        doctor:"Dr Saad"
    },
];
return NextResponse.json(data,{status:200})
}
