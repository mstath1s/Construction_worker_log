import { clearSessionCookie } from "@/utils/auth";
import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "cw_session";

export async function POST() {
    const response = NextResponse.json({ message: "Logged out" });
  
  // Clear the session cookie
  clearSessionCookie(response);
  return response;
}


