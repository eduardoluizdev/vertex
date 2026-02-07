import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname === '/login' ||
    req.nextUrl.pathname === '/register';
  const isHomePage = req.nextUrl.pathname === '/';

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  // Allow unauthenticated access to home page, login, and register
  if (!isLoggedIn && !isAuthPage && !isHomePage) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
