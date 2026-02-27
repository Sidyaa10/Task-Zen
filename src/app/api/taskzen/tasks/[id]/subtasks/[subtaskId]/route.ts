import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-server';
import { deleteSubtask, updateSubtask } from '@/lib/taskzen-service';
import { parseSubtaskUpdateInput } from '@/server/tasks/task.validation';

type Params = { params: Promise<{ id: string; subtaskId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id, subtaskId } = await params;
    const body = await request.json();
    const input = parseSubtaskUpdateInput(body);
    const task = await updateSubtask(userId, id, subtaskId, input);
    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update subtask';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id, subtaskId } = await params;
    const task = await deleteSubtask(userId, id, subtaskId);
    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete subtask';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
