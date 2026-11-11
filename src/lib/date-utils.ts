export function monthToDate(month: string): Date {
  const match = month.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    throw new Error('Invalid month format. Expected YYYY-MM');
  }
  const year = parseInt(match[1], 10);
  const monthNum = parseInt(match[2], 10);

  if (monthNum < 1 || monthNum > 12) {
    throw new Error('Invalid month. Must be between 01 and 12');
  }

  // Return first day of month in UTC
  return new Date(Date.UTC(year, monthNum - 1, 1));
}

export function getNextMonthStart(month: string): Date {
  const match = month.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    throw new Error('Invalid month format. Expected YYYY-MM');
  }
  const year = parseInt(match[1], 10);
  const monthNum = parseInt(match[2], 10);

  // Return first day of next month in UTC
  return new Date(Date.UTC(year, monthNum, 1));
}
