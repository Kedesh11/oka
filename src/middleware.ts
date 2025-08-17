import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const requireAuth = process.env.REQUIRE_DASHBOARD_AUTH === "true";
  if (!requireAuth) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const cookie = req.cookies.get("agency-auth");
    if (!cookie) {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
}; 