import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = 
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isProtectedRoute = ['/chat', '/qr', '/history', '/profile', '/settings', '/help'].some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.nextUrl);
    // Remember redirect url
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/chat', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/chat/:path*', 
    '/qr/:path*', 
    '/history/:path*', 
    '/profile/:path*', 
    '/settings/:path*', 
    '/help/:path*', 
    '/login', 
    '/signup'
  ],
};
