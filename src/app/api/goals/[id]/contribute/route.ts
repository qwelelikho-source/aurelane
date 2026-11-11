import { auth } from '@/lib/auth';
import { contributeToGoal } from '@/lib/data/goals';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
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
    const { amountCents } = body;

    if (typeof amountCents !== 'number' || amountCents <= 0) {
      return NextResponse.json(
        { error: 'VALIDATION', fields: { amountCents: 'Amount must be a positive number' } },
        { status: 400 }
      );
    }

    const result = await contributeToGoal(userId, params.id, amountCents);

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
