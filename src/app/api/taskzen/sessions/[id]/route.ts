import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-server';
import { markSession } from '@/lib/taskzen-service';
import { parseSessionUpdateInput } from '@/server/tasks/task.validation';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json();
    const { completed } = parseSessionUpdateInput(body);
    const task = await markSession(userId, id, completed);
    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update session';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
