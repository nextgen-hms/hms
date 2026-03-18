import { getAuthenticatedDoctor } from "@/src/lib/server/doctor";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const doctor = await getAuthenticatedDoctor(req);
    return NextResponse.json(doctor, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message === "Not authenticated" ? 401 : 403;

    return NextResponse.json({ error: message }, { status });
  }
}
