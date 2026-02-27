import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-server';
import { listMonthPreview } from '@/lib/taskzen-service';
import { parseMonth } from '@/server/tasks/task.validation';

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const now = new Date();
    const fallback = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const month = request.nextUrl.searchParams.get('month') ? parseMonth(request.nextUrl.searchParams.get('month')) : fallback;
    const preview = await listMonthPreview(userId, month);
    return NextResponse.json({ preview }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load month preview';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
