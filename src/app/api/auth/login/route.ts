import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, AUTH_TOKEN_TTL_SECONDS } from '@/server/auth/constants';
import { createJwt } from '@/server/auth/jwt';
import { verifyPassword } from '@/server/auth/password';
import { findUserByEmail } from '@/server/users/user.repository';

function authSecret(): string {
  return process.env.JWT_SECRET || 'dev-taskzen-secret';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const storedHash = user.hashedPassword || (user as any).password;
    if (!storedHash) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const ok = await verifyPassword(password, storedHash);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const token = createJwt(
      { sub: user._id.toString(), email: user.email, name: user.name },
      authSecret(),
      AUTH_TOKEN_TTL_SECONDS
    );

    const response = NextResponse.json(
      {
        token,
        user: { id: user._id.toString(), name: user.name, email: user.email, profilePicture: user.profilePicture, createdAt: user.createdAt },
      },
      { status: 200 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: AUTH_TOKEN_TTL_SECONDS,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to log in.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
