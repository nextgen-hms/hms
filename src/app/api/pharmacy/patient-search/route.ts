import { query } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchTerm = request.nextUrl.searchParams.get("q")?.trim();

    if (!searchTerm) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    const result = await query(
      `
        select
          p.patient_id,
          p.patient_name,
          p.age,
          p.gender,
          p.cnic,
          p.contact_number,
          count(v.visit_id)::int as active_visit_count
        from patient p
        join visit v on v.patient_id = p.patient_id
        where v.is_deleted = false
          and v.status not in ('completed', 'discharged')
          and (
            p.patient_name ilike $1
            or coalesce(p.cnic, '') ilike $1
            or p.patient_id::text ilike $1
            or v.visit_id::text ilike $1
          )
        group by
          p.patient_id,
          p.patient_name,
          p.age,
          p.gender,
          p.cnic,
          p.contact_number
        order by max(v.visit_timestamp) desc, p.patient_id desc
        limit 10
      `,
      [`%${searchTerm}%`]
    );

    return NextResponse.json({ success: true, data: result.rows }, { status: 200 });
  } catch (error) {
    console.error("Pharmacy patient search error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search patients" },
      { status: 500 }
    );
  }
}
