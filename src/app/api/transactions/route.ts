import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createTransaction, getTransactions } from '@/lib/data/transactions';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await getTransactions(session.user.id);
    return NextResponse.json(transactions);
  } catch {
    console.error('[TX_FETCH_ERROR]', { code: 'TX_FETCH_FAILED' });
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await createTransaction(session.user.id, body);

    if (result.error === 'VALIDATION') {
      return NextResponse.json(result, { status: 400 });
    }

    if (result.error === 'SERVER_ERROR') {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result.transaction, { status: 201 });
  } catch {
    console.error('[TX_CREATE_ERROR]', { code: 'TX_CREATE_UNEXPECTED' });
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
