import { NextResponse } from "next/server";
import { query } from "@/database/db";

// GET: Fetch all staff with their roles and basic permissions summary
export async function GET() {
  try {
    const staff = await query(`
      SELECT 
        s.staff_id, 
        s.name, 
        s.user_code, 
        s.role, 
        s.phone, 
        s.email,
        (SELECT COUNT(*) FROM staff_permissions sp WHERE sp.staff_id = s.staff_id AND sp.can_write = TRUE) as write_modules_count
      FROM staff s
      ORDER BY s.staff_id ASC
    `);

    return NextResponse.json(staff.rows);
  } catch (error: any) {
    console.error("Staff GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

// POST: Add new staff member
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, user_code, role, phone, email, password } = body;

    if (!name || !user_code || !role) {
      return NextResponse.json({ error: "Name, User Code, and Role are required" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO staff (name, user_code, role, phone, email, password) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING staff_id, name, user_code, role`,
      [name, user_code, role, phone, email, password || "123456"]
    );

    // Default permissions for new staff (Read-only for all modules)
    const modules = ['financials', 'inventory', 'patients', 'hr', 'pharmacy'];
    for (const mod of modules) {
        await query(
            `INSERT INTO staff_permissions (staff_id, module, can_read, can_write) 
             VALUES ($1, $2, TRUE, FALSE)`,
            [result.rows[0].staff_id, mod]
        );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Staff POST Error:", error);
    return NextResponse.json({ error: "Failed to create staff member" }, { status: 500 });
  }
}
