import crypto from 'crypto';

export type JwtPayload = Record<string, unknown> & {
  sub: string;
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
};

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  const padded = pad ? normalized + '='.repeat(4 - pad) : normalized;
  return Buffer.from(padded, 'base64').toString('utf8');
}

function sign(data: string, secret: string): string {
  return base64UrlEncode(crypto.createHmac('sha256', secret).update(data).digest());
}

export function createJwt(payload: JwtPayload, secret: string, expiresInSeconds: number): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body: JwtPayload = { ...payload, iat: now, exp: now + expiresInSeconds };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const signature = sign(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJwt(token: string, secret: string): JwtPayload | null {
  const [headerB64, payloadB64, signature] = token.split('.');
  if (!headerB64 || !payloadB64 || !signature) return null;

  const expected = sign(`${headerB64}.${payloadB64}`, secret);
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp < now) return null;
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') return null;
    return payload;
  } catch {
    return null;
  }
}

