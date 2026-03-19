import { NextRequest, NextResponse } from "next/server";

const DEPRECATION_MESSAGE =
  "The legacy dispenseMedicine currentMeds endpoint has been retired. Load prescription fulfillment through the Retail POS APIs instead.";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  await params;

  return NextResponse.json(
    {
      success: false,
      error: DEPRECATION_MESSAGE,
    },
    { status: 410 }
  );
}
