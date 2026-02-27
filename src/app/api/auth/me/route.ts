import { NextResponse } from 'next/server';
import { getRequestUserFromCookies } from '@/lib/auth-server';
import { findUserById } from '@/server/users/user.repository';

export async function GET() {
  const authUser = await getRequestUserFromCookies();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await findUserById(authUser.id);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json(
    {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    },
    { status: 200 }
  );
}
