import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTransactions } from '@/lib/data/transactions';
import { parseFilters, getDateRangeFromFilters } from '@/lib/filters';
import { buildCSV, addBOM, generateFilename, type TransactionRow } from '@/lib/csv';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const filters = parseFilters(url.searchParams);
    const dateRange = getDateRangeFromFilters(filters);
    const delimiter = (url.searchParams.get('delimiter') as ',' | ';') || ',';

    const transactions = await getTransactions(session.user.id, {
      start: dateRange?.start,
      end: dateRange?.end,
      category: filters.category,
      type: filters.type,
    });

    const rows: TransactionRow[] = transactions.map((tx) => ({
      date: tx.date.toISOString().split('T')[0],
      type: tx.type,
      category: tx.category,
      description: tx.description,
      amountCents: tx.amountCents,
    }));

    const csv = buildCSV(rows, delimiter);
    const csvWithBOM = addBOM(csv);
    const filename = generateFilename();

    return new NextResponse(csvWithBOM, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch {
    console.error('[CSV_EXPORT_ERROR]', { code: 'CSV_EXPORT_FAILED' });
    return NextResponse.json({ error: 'Failed to export transactions' }, { status: 500 });
  }
}
