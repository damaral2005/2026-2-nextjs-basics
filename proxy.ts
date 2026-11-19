import { loginPath, TOKEN_COOKIE } from "@/lib/auth-routes";
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isPageRequest = request.method === "GET" || request.method === "HEAD";
  if (isPageRequest && !request.cookies.get(TOKEN_COOKIE)?.value) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(new URL(loginPath(`${pathname}${search}`), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/students/:path*", "/counter"],
};
