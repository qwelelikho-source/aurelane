import { auth } from '@/lib/auth';
import { getBudgetById, updateBudget, deleteBudget } from '@/lib/data/budgets';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const result = await getBudgetById(userId, params.id);

  if (!result.success) {
    if (result.error === 'NOT_FOUND') {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    if (result.error === 'FORBIDDEN') {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await updateBudget(userId, params.id, body);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return NextResponse.json({ error: result.error }, { status: 404 });
      }
      if (result.error === 'FORBIDDEN') {
        return NextResponse.json({ error: result.error }, { status: 403 });
      }
      if (result.error === 'VALIDATION') {
        return NextResponse.json({ error: result.error, fields: result.fields }, { status: 400 });
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const result = await deleteBudget(userId, params.id);

  if (!result.success) {
    if (result.error === 'NOT_FOUND') {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    if (result.error === 'FORBIDDEN') {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
