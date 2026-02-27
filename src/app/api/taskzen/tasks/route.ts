import { NextRequest, NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-server';
import { createTask, listTasksForDate } from '@/lib/taskzen-service';
import { parsePage, parseTab, parseTaskCreateInput } from '@/server/tasks/task.validation';

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const date = request.nextUrl.searchParams.get('date') || new Date().toISOString().slice(0, 10);
    const tab = parseTab(request.nextUrl.searchParams.get('tab'));
    const page = parsePage(request.nextUrl.searchParams.get('page'));
    const tasks = await listTasksForDate(userId, date, tab, page);
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tasks';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const input = parseTaskCreateInput(body);
    const task = await createTask(userId, input);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create task';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
