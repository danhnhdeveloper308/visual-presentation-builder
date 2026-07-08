import { NextRequest, NextResponse } from "next/server";

/**
 * proxy.ts (Next 16, thay middleware.ts) — chỉ check nhanh có cookie hay không.
 * Permission check chi tiết vẫn ở NestJS backend. Xem docs/FRONTEND.md mục 1.
 */
export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has("access_token");
  if (!hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*", "/templates/:path*"],
};
