import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
const JWT_Secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecurekey");
export async function proxy(req: NextRequest) {
    //get token from request
    const token = req.cookies.get("token")?.value;
    //url to change path for redirection
    const url = req.nextUrl.clone();


    if (!token) {
        url.pathname = "/";
        return NextResponse.redirect(url);
    }
    try {
        const { payload } = await jwtVerify(token, JWT_Secret);
        if (url.pathname.startsWith("/doctor") && payload.role != "Doctor") {
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
        if (url.pathname.startsWith("/lab") && payload.role !== "Lab_Technician") {
            url.pathname = "/";
            return NextResponse.redirect(url);
        }
        if (url.pathname.startsWith("/receptionist") && payload.role !== "Receptionist") {
            url.pathname = "/";
            return NextResponse.redirect(url);
        }
        if (url.pathname.startsWith("/pharmacy") && payload.role !== "Pharmacist") {
            url.pathname = "/";
            return NextResponse.redirect(url);
        }
    }
    catch (err) {
        console.error("Invalid or expired token:", err);
        url.pathname = '/';
        return NextResponse.redirect(url);
    }
    return NextResponse.next();
}

export const config = { matcher: ["/doctor/:path*", "/lab/:path*", "/pharmacy/:path*", "/receptionist/:path*"], };