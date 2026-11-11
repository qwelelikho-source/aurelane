// Category colour palette - muted, cohesive colours
export const CATEGORY_COLORS: Record<string, string> = {
  'Salary': '#C9A24B', // gold
  'Freelance': '#C9A24B', // gold
  'Rent': '#7C9CBF', // muted blue
  'Groceries': '#5FB48A', // sage
  'Transport': '#C48B7A', // muted coral
  'Dining': '#9A8FC4', // muted purple
  'Entertainment': '#6FB5B5', // muted teal
  'Utilities': '#7C9CBF', // muted blue
  'Savings': '#5FB48A', // sage
  'Travel': '#C48B7A', // muted coral
  'Health': '#9A8FC4', // muted purple
  'Shopping': '#6FB5B5', // muted teal
  'Other': '#8B95A8', // muted
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
}

export const CATEGORIES = Object.keys(CATEGORY_COLORS);
