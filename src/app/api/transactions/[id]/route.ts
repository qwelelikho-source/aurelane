import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteTransaction, updateTransaction } from '@/lib/data/transactions';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = await updateTransaction(session.user.id, id, body);

    if (result.error === 'VALIDATION') {
      return NextResponse.json(
        { error: result.error, fields: result.fields },
        { status: 400 }
      );
    }

    if (result.error === 'NOT_FOUND') {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    if (result.error === 'FORBIDDEN') {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    if (result.error === 'SERVER_ERROR') {
      return NextResponse.json(
        { error: result.error, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json(result.transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await deleteTransaction(session.user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
