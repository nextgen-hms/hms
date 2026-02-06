import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecurekey");

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, secret);

        return NextResponse.json({
            user_code: payload.user_code,
            role: payload.role,
            name: payload.name
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
}
