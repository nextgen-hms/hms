import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { patientId: string } }
) {
  const id = Number(params.patientId); // convert to number

  const data = {
    labOrders: [
      {
        patientId: 1,
        orderDate: "2025-09-01",
        category: "Blood",
        testName: "Complete Blood Count (CBC)",
        priority: "Routine",
        status: "Result Sent",
        notes: "Normal ranges. PDF uploaded.",
        orderedBy: "Dr. Ayesha Khan",
      },
      {
        patientId: 1,
        orderDate: "2025-09-03",
        category: "Urine",
        testName: "Urinalysis",
        priority: "Routine",
        status: "Completed",
        notes: "Sample collected, result under review.",
        orderedBy: "Dr. Ali Raza",
      },
      {
        patientId: 2,
        orderDate: "2025-09-04",
        category: "X-Ray",
        testName: "Chest X-Ray",
        priority: "Urgent",
        status: "In Progress",
        notes: "Radiology team notified.",
        orderedBy: "Dr. Ayesha Khan",
      },
      {
        patientId: 3,
        orderDate: "2025-09-05",
        category: "Blood",
        testName: "Blood Sugar (Fasting)",
        priority: "STAT",
        status: "Sample Taken",
        notes: "Sample collected at 9 AM.",
        orderedBy: "Dr. Bilal Ahmed",
      },
      {
        patientId: 3,
        orderDate: "2025-09-05",
        category: "CT Scan",
        testName: "CT Brain Without Contrast",
        priority: "Urgent",
        status: "Ordered",
        notes: "Patient scheduled for 2 PM.",
        orderedBy: "Dr. Ali Raza",
      },
    ],
  };

 
  const filtered = data.labOrders.filter((d) => d.patientId === id);

  return NextResponse.json(filtered);
}

export async function POST(req:NextRequest){
    const data=await req.json();

    return NextResponse.json(data);
}


export async function PATCH(req:NextRequest){
    const data=await req.json();

    return NextResponse.json(data);
}
