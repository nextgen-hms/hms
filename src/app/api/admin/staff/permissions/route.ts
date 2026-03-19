import { NextResponse } from "next/server";
import { query } from "@/database/db";

// GET: Fetch permissions for a specific staff member
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staff_id");

    if (!staffId) {
        return NextResponse.json({ error: "Staff ID is required" }, { status: 400 });
    }

    try {
        const permissions = await query(
            "SELECT * FROM staff_permissions WHERE staff_id = $1", 
            [staffId]
        );
        return NextResponse.json(permissions.rows);
    } catch (error: any) {
        console.error("Permissions GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 });
    }
}

// PUT: Bulk update permissions for a staff member
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { staff_id, permissions } = body; // permissions = [{ module: 'string', can_read: boolean, can_write: boolean }]

        if (!staff_id || !permissions) {
            return NextResponse.json({ error: "Staff ID and permissions are required" }, { status: 400 });
        }

        for (const p of permissions) {
            await query(
                `INSERT INTO staff_permissions (staff_id, module, can_read, can_write) 
                 VALUES ($1, $2, $3, $4) 
                 ON CONFLICT (staff_id, module) 
                 DO UPDATE SET can_read = $3, can_write = $4`,
                [staff_id, p.module, p.can_read, p.can_write]
            );
        }

        return NextResponse.json({ message: "Permissions updated successfully" });
    } catch (error: any) {
        console.error("Permissions PUT Error:", error);
        return NextResponse.json({ error: "Failed to update permissions" }, { status: 500 });
    }
}
