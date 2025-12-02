import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "./lib/constants/constants";


// Paths that don't require authentication
const PUBLIC_PATHS = ["/login", "/api/login", "/api/logout", "/_next", "/favicon.ico"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((publicPath) => pathname.startsWith(publicPath));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    // For API routes, return 401 Unauthorized instead of redirecting
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For page routes, keep redirecting to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  try {
    const { payload } = await jwtVerify(
      sessionCookie!,
      new TextEncoder().encode(process.env.NEXT_JWT_SECRET!)
    );

    return NextResponse.next();
  } catch (err) {
    console.error("JWT ERROR:", err);
    return NextResponse.json({ error: "Unauthorizedssssssss" }, { status: 401 });
  }

}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};


