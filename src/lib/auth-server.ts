import { NextRequest } from 'next/server';
import {
  getAuthUserFromCookies as getAuthUserFromCookieStore,
  getAuthUserFromRequest as getAuthUserFromReq,
} from '@/server/auth/session';

type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

export function getAuthUserFromRequest(request: NextRequest): AuthUser | null {
  return getAuthUserFromReq(request);
}

export async function getRequestUserId(request: NextRequest): Promise<string | null> {
  return getAuthUserFromRequest(request)?.id || null;
}

export async function getRequestUserFromCookies(): Promise<AuthUser | null> {
  return getAuthUserFromCookieStore();
}
