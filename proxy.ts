import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin-token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    return NextResponse.redirect(
      new URL("/admin/login", request.nextUrl.origin),
    );
  }

  if (!process.env.JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY missing");
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);
    if (
      !payload ||
      !payload.email ||
      payload.user_type !== 1 ||
      !payload.user_id
    ) {
      throw new Error("Unauthorized");
    }
    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 },
      );
    }
    const response = NextResponse.redirect(
      new URL("/admin/login", request.nextUrl.origin),
    );

    response.cookies.delete("admin-token");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
