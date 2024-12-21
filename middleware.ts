import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Eğer kullanıcı giriş yapmamışsa ve korunan bir sayfaya erişmeye çalışıyorsa
    if (!req.nextauth.token && req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Hangi sayfalarda middleware'in çalışacağını belirtiyoruz
export const config = {
  matcher: ["/", "/dashboard/:path*"]
}; 