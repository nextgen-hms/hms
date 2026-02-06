
import pool from "@/database/db";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecurekey");
export async function POST(req: NextRequest) {
   const body = await req.json();
   const { user_code, password } = body;
   const client = await pool.connect();
   let role;
   let res;
   try {
      if (user_code.includes("DOC")) {
         res = await client.query("select user_code,doctor_name as name,'Doctor' as role from doctor where user_code = $1 and  password = $2 ", [user_code, password]);
      }
      else {
         res = await client.query("select user_code,name,role from staff where user_code = $1 and  password = $2 ", [user_code, password]);

      }
      if (res!.rows.length === 0) {
         return NextResponse.json({ error: "Invalid Credentials" }, { status: 401 })
      }
      const user = res!.rows[0];
      const token = await new SignJWT({ user_code: user.user_code, role: user.role, name: user.name })
         .setProtectedHeader({ alg: "HS256" })
         .setExpirationTime("8h")
         .sign(secret);
      const response = NextResponse.json({ success: true, role: user.role }, { status: 200 });
      response.cookies.set("token", token, {
         httpOnly: true,
         secure: true,
         sameSite: "lax",
         maxAge: 60 * 60,
         path: "/",
      })
      return response;
   }
   catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Server Error" }, { status: 500 });
   }
   finally {
      client.release();
   }
}