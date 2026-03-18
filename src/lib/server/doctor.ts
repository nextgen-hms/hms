import { query } from "@/database/db";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

const secret = new TextEncoder().encode(
  process.env.secret_key || "hms_super_secure_2026_clinic_key"
);

export type AuthenticatedDoctor = {
  doctor_id: number;
  doctor_name: string;
  specialization: string;
  user_code: string;
  role: string;
};

export async function getAuthenticatedDoctor(
  req: NextRequest
): Promise<AuthenticatedDoctor> {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const { payload } = await jwtVerify(token, secret);

  if (payload.role !== "Doctor" || !payload.user_code) {
    throw new Error("Doctor access required");
  }

  const doctorResult = await query(
    `
      select doctor_id, doctor_name, specialization, user_code
      from doctor
      where user_code = $1
      limit 1
    `,
    [payload.user_code]
  );

  if (doctorResult.rows.length === 0) {
    throw new Error("Doctor profile not found");
  }

  const doctor = doctorResult.rows[0];

  return {
    doctor_id: Number(doctor.doctor_id),
    doctor_name: doctor.doctor_name,
    specialization: doctor.specialization,
    user_code: doctor.user_code,
    role: String(payload.role),
  };
}
