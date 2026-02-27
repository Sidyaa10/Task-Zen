import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-server';
import { profileStats } from '@/lib/taskzen-service';

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const stats = await profileStats(userId);
    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load profile stats';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

