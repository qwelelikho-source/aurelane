export function getDashboardTitle(path: string): string {
  const titles: Record<string, string> = {
    '': 'Dashboard',
    'transactions': 'Transactions',
    'budgets': 'Budgets',
    'goals': 'Savings Goals',
    'charts': 'Charts',
  };

  return titles[path] || 'Dashboard';
}
