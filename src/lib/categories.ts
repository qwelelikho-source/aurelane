// Category colour palette - muted, cohesive colours
export const CATEGORY_COLORS: Record<string, string> = {
  'Salary': '#C9A24B', // gold
  'Freelance': '#C9A24B', // gold
  'Interest': '#C9A24B', // gold
  'Gift': '#C9A24B', // gold
  'Rent': '#7C9CBF', // muted blue
  'Groceries': '#5FB48A', // sage
  'Transport': '#C48B7A', // muted coral
  'Utilities': '#7C9CBF', // muted blue
  'Dining': '#9A8FC4', // muted purple
  'Subscriptions': '#6FB5B5', // muted teal
  'Health': '#9A8FC4', // muted purple
  'Shopping': '#6FB5B5', // muted teal
  'Travel': '#C48B7A', // muted coral
  'Savings': '#5FB48A', // sage
  'Other': '#8B95A8', // muted
};

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Interest', 'Gift', 'Other'];
export const EXPENSE_CATEGORIES = ['Groceries', 'Rent', 'Transport', 'Utilities', 'Dining', 'Subscriptions', 'Health', 'Shopping', 'Travel', 'Other'];

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
}

export function getCategoriesByType(type: 'INCOME' | 'EXPENSE'): string[] {
  return type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export const CATEGORIES = Object.keys(CATEGORY_COLORS);
