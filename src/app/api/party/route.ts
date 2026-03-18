import { NextRequest, NextResponse } from "next/server";
import { query } from '@/database/db';

export async function GET(req: NextRequest) {
    try {
        const data = await query('SELECT * FROM party ORDER BY name ASC');
        return NextResponse.json(data.rows);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to fetch parties" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, contact_number, address, email, gst_number } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const result = await query(
            `INSERT INTO party (name, contact_number, address, email, gst_number) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [name, contact_number, address, email, gst_number]
        );

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to create party" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { party_id, name, contact_number, address, email, gst_number, status } = body;

        if (!party_id) {
            return NextResponse.json({ error: "Party ID is required" }, { status: 400 });
        }

        const result = await query(
            `UPDATE party 
             SET name = $1, contact_number = $2, address = $3, email = $4, gst_number = $5, status = $6
             WHERE party_id = $7 
             RETURNING *`,
            [name, contact_number, address, email, gst_number, status, party_id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Party not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to update party" }, { status: 500 });
    }
}