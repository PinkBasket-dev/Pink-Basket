import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Allow access to the Login Page itself
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // 2. Protect everything under /admin
  if (pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('admin_auth');
    const correctPassword = process.env.ADMIN_PASSWORD;

    // If no cookie, or password doesn't match -> Redirect to Login
    if (!authCookie || authCookie.value !== correctPassword) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Apply this middleware only to /admin routes
export const config = {
  matcher: ['/admin/:path*'],
};