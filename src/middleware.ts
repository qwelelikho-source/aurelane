import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// @ts-ignore - next-auth beta has type issues
export default auth((req: any) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register');
  const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard');

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (isDashboardPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
