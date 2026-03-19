import { query } from "@/database/db";
import { getAuthenticatedDoctor } from "@/src/lib/server/doctor";
import {
  getDoctorEncounterNote,
  upsertDoctorEncounterNote,
} from "@/src/lib/server/doctorWorkspace";
import { NextRequest, NextResponse } from "next/server";

function getDoctorRouteErrorStatus(message: string) {
  if (message === "Not authenticated") {
    return 401;
  }

  if (message.includes("not found")) {
    return 404;
  }

  return 403;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ visitId: string }> }
) {
  try {
    const doctor = await getAuthenticatedDoctor(req);
    const { visitId } = await params;

    const encounter = await getDoctorEncounterNote(
      query as typeof query,
      Number(visitId),
      doctor.doctor_id
    );

    return NextResponse.json(encounter, { status: 200 });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch doctor encounter note";
    const status = getDoctorRouteErrorStatus(message);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ visitId: string }> }
) {
  try {
    const doctor = await getAuthenticatedDoctor(req);
    const { visitId } = await params;
    const body = await req.json();

    if (typeof body.doctor_note !== "string") {
      return NextResponse.json({ error: "doctor_note is required" }, { status: 400 });
    }

    const encounter = await upsertDoctorEncounterNote(query as typeof query, {
      visitId: Number(visitId),
      doctorId: doctor.doctor_id,
      doctorNote: body.doctor_note,
    });

    return NextResponse.json(encounter, { status: 200 });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to save doctor encounter note";
    const status = getDoctorRouteErrorStatus(message);
    return NextResponse.json({ error: message }, { status });
  }
}
