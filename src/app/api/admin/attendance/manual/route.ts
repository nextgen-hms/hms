import pool from "@/database/db";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.secret_key || "hms_super_secure_2026_clinic_key");

// POST: Admin manual entry or override for staff attendance
export async function POST(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { staff_id, date, status, check_in_time, check_out_time } = await req.json();

    if (!staff_id || !date || !status) {
        return NextResponse.json({ error: "Missing required fields (staff_id, date, status)" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        // 1. Verify the requester is an Admin (Double check if middleware is already protecting, but good safety)
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== "Admin") {
            return NextResponse.json({ error: "Only admins can perform manual overrides" }, { status: 403 });
        }

        // 2. Insert or Update (UPSERT) the attendance record
        const query = `
            INSERT INTO staff_attendance (staff_id, date, status, check_in_time, check_out_time, marked_by, admin_id)
            VALUES ($1, $2, $3, $4, $5, 'Admin', (SELECT staff_id FROM staff WHERE user_code = $6))
            ON CONFLICT (staff_id, date) DO UPDATE SET
                status = EXCLUDED.status,
                check_in_time = COALESCE(EXCLUDED.check_in_time, staff_attendance.check_in_time),
                check_out_time = COALESCE(EXCLUDED.check_out_time, staff_attendance.check_out_time),
                admin_id = EXCLUDED.admin_id,
                marked_by = EXCLUDED.marked_by
            RETURNING *
        `;
        const params = [staff_id, date, status, check_in_time, check_out_time, payload.user_code];
        const res = await client.query(query, params);

        return NextResponse.json({ message: "Attendance record updated manually", data: res.rows[0] });
    } catch (err) {
        console.error("Manual Attendance POST Error:", err);
        return NextResponse.json({ error: "Failed to record manual attendance" }, { status: 500 });
    } finally {
        client.release();
    }
}
