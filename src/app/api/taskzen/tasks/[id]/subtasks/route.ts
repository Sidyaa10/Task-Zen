import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-server';
import { createSubtask } from '@/lib/taskzen-service';
import { parseSubtaskCreateInput } from '@/server/tasks/task.validation';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, scheduledDate } = parseSubtaskCreateInput(body);
    const task = await createSubtask(userId, id, title, scheduledDate);
    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create subtask';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
