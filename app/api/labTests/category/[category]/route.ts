import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { category: string } }
) {
  const ctg = params.category.toLowerCase(); // normalize category input

  const data = [
    // 🔹 Blood Tests
    { category: "blood", testName: "Complete Blood Count (CBC)", description: "Measures blood cell counts", sampleType: "Blood", price: 1500 },
    { category: "blood", testName: "Blood Sugar (Fasting)", description: "Measures glucose levels", sampleType: "Blood", price: 500 },
    { category: "blood", testName: "Lipid Profile", description: "Cholesterol & triglycerides", sampleType: "Blood", price: 2000 },
    { category: "blood", testName: "Liver Function Test (LFT)", description: "Assesses liver health", sampleType: "Blood", price: 1800 },
    { category: "blood", testName: "Kidney Function Test (KFT)", description: "Checks kidney function", sampleType: "Blood", price: 1700 },

    // 🔹 Urine Tests
    { category: "urine", testName: "Urinalysis", description: "General urine test", sampleType: "Urine", price: 700 },
    { category: "urine", testName: "Urine Culture", description: "Detects bacteria in urine", sampleType: "Urine", price: 1500 },

    // 🔹 X-Ray
    { category: "x-ray", testName: "Chest X-Ray", description: "Checks lungs & chest area", sampleType: "Imaging", price: 2500 },
    { category: "x-ray", testName: "Abdominal X-Ray", description: "Examines abdominal area", sampleType: "Imaging", price: 3000 },

    // 🔹 CT Scan
    { category: "ct-scan", testName: "CT Brain Without Contrast", description: "Brain imaging", sampleType: "Imaging", price: 6000 },
    { category: "ct-scan", testName: "CT Abdomen", description: "Detailed abdominal scan", sampleType: "Imaging", price: 8000 },

    // 🔹 MRI
    { category: "mri", testName: "MRI Brain", description: "Brain imaging", sampleType: "Imaging", price: 10000 },
    { category: "mri", testName: "MRI Spine", description: "Spine imaging", sampleType: "Imaging", price: 12000 },
  ];

  const filtered = data.filter((d) => d.category === ctg);

  return NextResponse.json(filtered);
}
