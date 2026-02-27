import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/server/auth/constants';
import { verifyJwt } from '@/server/auth/jwt';

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

function authSecret(): string {
  return process.env.JWT_SECRET || 'dev-taskzen-secret';
}

export function getAuthUserFromRequest(request: NextRequest): AuthUser | null {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyJwt(token, authSecret());
  if (!payload) return null;
  return {
    id: payload.sub,
    email: payload.email,
    name: typeof payload.name === 'string' ? payload.name : undefined,
  };
}

export async function getAuthUserFromCookies(): Promise<AuthUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyJwt(token, authSecret());
  if (!payload) return null;
  return {
    id: payload.sub,
    email: payload.email,
    name: typeof payload.name === 'string' ? payload.name : undefined,
  };
}
