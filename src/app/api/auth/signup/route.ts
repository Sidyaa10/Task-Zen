import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, AUTH_TOKEN_TTL_SECONDS } from '@/server/auth/constants';
import { createJwt } from '@/server/auth/jwt';
import { hashPassword } from '@/server/auth/password';
import { createUser, ensureUserIndexes, findUserByEmail } from '@/server/users/user.repository';

function authSecret(): string {
  return process.env.JWT_SECRET || 'dev-taskzen-secret';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const profilePicture = typeof body.profilePicture === 'string' ? body.profilePicture : null;

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters.' }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    await ensureUserIndexes();
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email is already registered.' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser({ name, email, hashedPassword, profilePicture });
    const token = createJwt(
      { sub: user._id, email: user.email, name: user.name },
      authSecret(),
      AUTH_TOKEN_TTL_SECONDS
    );

    const response = NextResponse.json(
      {
        token,
        user: { id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture, createdAt: user.createdAt },
      },
      { status: 201 }
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
    const message = error instanceof Error ? error.message : 'Failed to sign up.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
