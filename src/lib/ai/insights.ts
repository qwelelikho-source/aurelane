import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { env } from '@/lib/env';
import { InsightSummary } from '@/lib/insights/rules';
import { generateFallbackInsight } from './fallback';

const aiResponseSchema = z.object({
  status: z.enum(['on_track', 'watch', 'overspending', 'not_enough_data']),
  headline: z.string(),
  observations: z.array(z.string()).min(2).max(3),
  suggestion: z.string(),
});

export type AIInsight = z.infer<typeof aiResponseSchema>;

const SYSTEM_PROMPT = `You are a helpful financial assistant for a personal finance app called Aurelane. Your role is to provide general information about the user's recorded spending patterns, not financial advice.

IMPORTANT RULES:
1. Use ONLY the numerical data provided in the summary. Do not make assumptions or add information not present in the data.
2. Be factual and non-judgemental. Avoid shame or guilt language.
3. NEVER recommend specific financial products, investments, loans, or insurance.
4. NEVER predict market movements or stock performance.
5. If the data is insufficient to provide meaningful insights, say so clearly.
6. For major financial decisions, suggest consulting a licensed financial adviser.
7. Keep responses concise (2-3 observations, 1 suggestion).
8. The status should be: "on_track" (doing well), "watch" (caution needed), "overspending" (over budget), or "not_enough_data" (insufficient data).

Respond in JSON format with this structure:
{
  "status": "on_track|watch|overspending|not_enough_data",
  "headline": "Brief headline",
  "observations": ["observation 1", "observation 2", "observation 3"],
  "suggestion": "Actionable suggestion"
}`;

export async function generateAIInsight(summary: InsightSummary): Promise<AIInsight | null> {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('AI_INSIGHTS_NO_KEY', 'ANTHROPIC_API_KEY not configured');
    return null;
  }

  const model = env.AI_MODEL || 'claude-haiku-5-5';

  try {
    const anthropic = new Anthropic({ apiKey });

    const userMessage = `
Analyze this financial summary for a user:

- Month: ${summary.month}
- Monthly savings rate: ${summary.monthlySavingsRate.toFixed(1)}%
- Projected month-end spend: R${(summary.projectedMonthEndSpendCents / 100).toFixed(2)}
- Data days: ${summary.dataDays}
- Overall status from rules: ${summary.overallStatus}

Budget statuses:
${summary.budgetStatuses.map(b => `- ${b.category}: ${b.percentage.toFixed(1)}% of limit (${b.status})`).join('\n')}

Top spending categories:
${summary.topCategories.map(c => `- ${c.category}: R${(c.spentCents / 100).toFixed(2)}`).join('\n')}

${summary.monthComparison ? `
Previous month comparison:
- Income change: ${summary.monthComparison.incomeChange.toFixed(1)}%
- Expense change: ${summary.monthComparison.expenseChange.toFixed(1)}%
` : 'No previous month data available.'}

Provide an analysis in JSON format.
`;

    const response = await anthropic.messages.create({
      model,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      console.error('AI_INSIGHTS_INVALID_RESPONSE', 'Non-text response from AI');
      return null;
    }

    const parsed = aiResponseSchema.safeParse(JSON.parse(content.text));
    if (!parsed.success) {
      console.error('AI_INSIGHTS_INVALID_JSON', parsed.error);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('AI_INSIGHTS_API_ERROR', error);
    return null;
  }
}

export { generateFallbackInsight };
