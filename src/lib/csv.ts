

export interface TransactionRow {
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string | null;
  amountCents: number;
}

export function escapeCSVValue(value: string): string {
  // Guard against spreadsheet formula injection
  if (/^[=+\-@\t\r]/.test(value)) {
    value = `'${value}`;
  }

  // Escape quotes and wrap in quotes if needed
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    value = `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function formatZARForCSV(amountCents: number): string {
  const rands = amountCents / 100;
  return rands.toFixed(2);
}

export function buildCSV(
  transactions: TransactionRow[],
  delimiter: ',' | ';' = ','
): string {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
  const headerRow = headers.map(escapeCSVValue).join(delimiter);

  const rows = transactions.map((tx) => {
    const date = escapeCSVValue(tx.date);
    const type = escapeCSVValue(tx.type);
    const category = escapeCSVValue(tx.category);
    const description = escapeCSVValue(tx.description || '');
    const amount = escapeCSVValue(formatZARForCSV(tx.amountCents));

    return [date, type, category, description, amount].join(delimiter);
  });

  return [headerRow, ...rows].join('\n');
}

export function addBOM(csv: string): string {
  return '\uFEFF' + csv;
}

export function generateFilename(date?: Date): string {
  const now = date || new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `aurelane-transactions-${year}-${month}.csv`;
}
