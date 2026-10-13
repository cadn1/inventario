import { NextRequest, NextResponse } from "next/server";
import { COOKIE, authToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/login")) return NextResponse.next();
  if (req.cookies.get(COOKIE)?.value === (await authToken())) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest).*)"],
};
