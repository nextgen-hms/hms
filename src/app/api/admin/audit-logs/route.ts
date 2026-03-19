import { NextResponse } from "next/server";
import { query } from "@/database/db";

// GET: Fetch system audit logs with staff details
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const logs = await query(`
      SELECT 
        l.*, 
        s.name as staff_name, 
        s.role as staff_role,
        s.user_code
      FROM audit_logs l
      LEFT JOIN staff s ON l.staff_id = s.staff_id
      ORDER BY l.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    return NextResponse.json(logs.rows);
  } catch (error: any) {
    console.error("Audit Logs GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}

// POST: Utility to log a new action (usually called internally, but can be used via API if needed)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { staff_id, action, entity_type, entity_id, details } = body;

    const result = await query(
      `INSERT INTO audit_logs (staff_id, action, entity_type, entity_id, details) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [staff_id, action, entity_type, entity_id, details ? JSON.stringify(details) : null]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Audit Logs POST Error:", error);
    return NextResponse.json({ error: "Failed to create audit log" }, { status: 500 });
  }
}
