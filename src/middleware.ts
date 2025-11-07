import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { UserRole } from "@/domain/entities/Auth";

const STAFF_PATHS = [
  "/dashboardstaff",
  "/reservations",
  "/check-in",
  "/swap",
  "/inventory",
  "/reports",
];
const ADMIN_PATHS = [
  "/dashboard",
  "/battery-management",
  "/station-management",
  "/user-management",
  "/transactions-reports",
  "/system-config",
];
const AUTH_USER_PATHS = ["/profile"];
const PUBLIC_AUTH_PATHS = [
  "/login",
  "/register",
  "/forgotpassword",
  "/resetpassword",
];

function isIn(paths: string[], pathname: string) {
  return paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const token = req.cookies.get("token")?.value;
  const roleStr = (req.cookies.get("role")?.value || "").toUpperCase();
  const hasAuth = Boolean(token && roleStr);

  console.log("[Middleware]", {
    pathname,
    hasToken: Boolean(token),
    role: roleStr || "none",
    hasAuth,
  });

  // DEV MODE: Bypass authentication nếu có NEXT_PUBLIC_API_TOKEN trong .env
  const devToken = process.env.NEXT_PUBLIC_API_TOKEN;
  const allowDevBypass = Boolean(devToken);

  const inStaff = isIn(STAFF_PATHS, pathname);
  const inAdmin = isIn(ADMIN_PATHS, pathname);
  const inAuthUser = isIn(AUTH_USER_PATHS, pathname);
  const inPublicAuth = isIn(PUBLIC_AUTH_PATHS, pathname);

  // Cho phép truy cập công khai các route employee (STAFF_PATHS)
  if (inStaff) {
    return NextResponse.next();
  }

  // Bảo vệ các trang admin - yêu cầu đăng nhập và role ADMIN
  if (inAdmin) {
    // DEV MODE: Cho phép bypass nếu có dev token
    if (allowDevBypass) {
      console.log(
        "🔓 [DEV MODE] Bypassing admin auth check - using NEXT_PUBLIC_API_TOKEN"
      );
      return NextResponse.next();
    }

    if (!hasAuth) {
      // Chưa đăng nhập -> redirect về login
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Check if role is Admin
    if (roleStr !== UserRole.ADMIN.toUpperCase()) {
      // Không phải admin -> redirect về home
      const url = req.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }
  }

  // Nếu đã đăng nhập mà vào /login, /register, ... thì đẩy về homepage
  if (inPublicAuth && hasAuth) {
    // Trong môi trường phát triển cho phép truy cập trang login/register
    if (process.env.NODE_ENV === "development") {
      return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (inAuthUser && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboardstaff/:path*",
    "/reservations/:path*",
    "/check-in/:path*",
    "/swap/:path*",
    "/inventory/:path*",
    "/reports/:path*",
    "/dashboard/:path*",
    "/battery-management/:path*",
    "/station-management/:path*",
    "/user-management/:path*",
    "/transactions-reports/:path*",
    "/system-config/:path*",
    "/profile/:path*",
    "/login",
    "/register",
    "/forgotpassword",
    "/resetpassword",
  ],
};
