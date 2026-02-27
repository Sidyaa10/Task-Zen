import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth-constants';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const loginUrl = new URL('/login', requestUrl.origin);
  const response = NextResponse.redirect(loginUrl, { status: 302 });
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}

