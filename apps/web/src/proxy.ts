import { NextRequest, NextResponse } from "next/server";

/**
 * proxy.ts (Next 16, thay middleware.ts) — chỉ check nhanh có cookie hay không.
 * Permission check chi tiết vẫn ở NestJS backend. Xem docs/FRONTEND.md mục 1.
 */

/** Trang chỉ dành cho khách — đã có session thì đá về dashboard (hoặc ?next=). */
const GUEST_ONLY_PATHS = ["/login", "/register"];

export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has("access_token");
  const { pathname } = req.nextUrl;

  if (GUEST_ONLY_PATHS.includes(pathname)) {
    if (!hasSession) return NextResponse.next();
    const next = req.nextUrl.searchParams.get("next");
    // Chỉ nhận path nội bộ ("/..."), chặn "//host" (open redirect)
    const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
    return NextResponse.redirect(new URL(target, req.url));
  }

  if (!hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  // LƯU Ý: KHÔNG thêm "/p/:path*" — trang xem qua link share public không cần đăng nhập
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/account/:path*",
    "/editor/:path*",
    "/view/:path*",
    "/templates/:path*",
    "/trash/:path*",
    "/themes/:path*",
    "/admin/:path*",
  ],
};
