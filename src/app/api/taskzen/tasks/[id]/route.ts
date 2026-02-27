import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-server';
import { deleteTask, getTaskWithChildren, updateTask } from '@/lib/taskzen-service';
import { parseTaskUpdateInput } from '@/server/tasks/task.validation';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const task = await getTaskWithChildren(userId, id);
    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch task';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json();
    const input = parseTaskUpdateInput(body);
    const task = await updateTask(userId, id, input);
    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update task';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    await deleteTask(userId, id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete task';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
