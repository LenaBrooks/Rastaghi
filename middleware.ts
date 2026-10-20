import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminTokenAsync } from "@/lib/auth-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const secret =
    process.env.ADMIN_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "";
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const ok = await verifyAdminTokenAsync(token, secret);

  if (!ok) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
