import { NextRequest, NextResponse } from "next/server";

const DEPRECATION_MESSAGE =
  "The legacy dispenseMedicine endpoint has been retired. Use the Retail POS transaction APIs under /api/transactions instead.";

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: DEPRECATION_MESSAGE,
    },
    { status: 410 }
  );
}
