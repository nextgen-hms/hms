import { NextResponse } from "next/server";
import { query } from "@/database/db";

// GET: Fetch all system settings
export async function GET() {
  try {
    const settings = await query("SELECT * FROM system_settings ORDER BY setting_key ASC");
    return NextResponse.json(settings.rows);
  } catch (error: any) {
    console.error("Settings GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PUT: Bulk update settings
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { settings, staff_id } = body; // settings = [{ key: 'string', value: any }]

    if (!settings) {
      return NextResponse.json({ error: "Settings are required" }, { status: 400 });
    }

    for (const s of settings) {
      await query(
        `UPDATE system_settings 
         SET setting_value = $2::jsonb, updated_at = CURRENT_TIMESTAMP, updated_by = $3
         WHERE setting_key = $1`,
        [s.key, JSON.stringify(s.value), staff_id]
      );

      // Log the change
      await query(
        `INSERT INTO audit_logs (staff_id, action, entity_type, entity_id, details) 
         VALUES ($1, $2, $3, $4, $5)`,
        [staff_id, 'Update Setting', 'System', s.key, JSON.stringify({ old: '...', new: s.value })]
      );
    }

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error: any) {
    console.error("Settings PUT Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
