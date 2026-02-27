import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth-constants';
import { verifyJwt } from '@/lib/jwt';

const publicWebRoutes = ['/', '/login', '/signup', '/register'];
const publicApiRoutes = ['/api/auth/login', '/api/auth/signup', '/api/auth/logout', '/api/test-db', '/api/genkit'];

function authSecret(): string {
  return process.env.JWT_SECRET || 'dev-taskzen-secret';
}

function isPublicPath(pathname: string): boolean {
  if (publicWebRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) return true;
  if (publicApiRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) return true;
  if (pathname.startsWith('/_next') || pathname === '/favicon.ico') return true;
  if (pathname.includes('.') && !pathname.endsWith('.html')) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? verifyJwt(token, authSecret()) : null;

  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
