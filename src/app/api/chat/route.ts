import 'server-only';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { env } from '@/lib/env';
import { getMonthSummary, getBudgetStatus, getCategoryTrend } from '@/lib/ai/tools';

const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  month: z.string().optional(),
});

const MAX_TOOL_CALLS_PER_MESSAGE = 3;
const MAX_TOKENS_PER_CONVERSATION = 10000;

// Rate limiting for chat (more restrictive than insights)
const chatRateLimitMap = new Map<string, { count: number; resetTime: number; tokens: number }>();
const CHAT_RATE_LIMIT_PER_HOUR = 20;
const CHAT_RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkChatRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = chatRateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    chatRateLimitMap.set(userId, { count: 1, resetTime: now + CHAT_RATE_LIMIT_WINDOW, tokens: 0 });
    return true;
  }

  if (userLimit.count >= CHAT_RATE_LIMIT_PER_HOUR) {
    return false;
  }

  if (userLimit.tokens >= MAX_TOKENS_PER_CONVERSATION) {
    return false;
  }

  userLimit.count++;
  return true;
}

const SYSTEM_PROMPT = `You are a helpful financial assistant for Aurelane, a personal finance app. Your role is to answer questions about the user's recorded spending and financial patterns.

IMPORTANT RULES:
1. Use ONLY the data provided by the tools. Do not make assumptions or add information not present in the data.
2. Be factual and non-judgemental. Avoid shame or guilt language.
3. NEVER recommend specific financial products, investments, loans, or insurance.
4. NEVER predict market movements or stock performance.
5. If the data is insufficient to answer a question, say so clearly.
6. For major financial decisions, suggest consulting a licensed financial adviser.
7. Keep responses concise and focused on the user's question.
8. All monetary amounts are in South African rand (ZAR).
9. The user cannot provide a userId - it comes from their session.

Available tools:
- get_month_summary: Get monthly income, expenses, savings, and transaction count
- get_budget_status: Get budget status for all categories in a month
- get_category_trend: Compare category spending between current and previous month

Use these tools to retrieve data before answering questions about finances.`;

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  // Check if user has AI enabled
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiEnabled: true },
  });

  if (!user || !user.aiEnabled) {
    return Response.json({ error: 'AI_NOT_ENABLED' }, { status: 403 });
  }

  // Rate limiting
  if (!checkChatRateLimit(userId)) {
    return Response.json({ error: 'RATE_LIMITED' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: 'VALIDATION', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { message, month } = parsed.data;
    const apiKey = env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return Response.json({ error: 'AI_NOT_CONFIGURED' }, { status: 500 });
    }

    const model = env.AI_MODEL || 'claude-haiku-5-5';
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const anthropic = new Anthropic({ apiKey });

    const messages: Array<{ role: 'user' | 'assistant'; content: string | Array<any> }> = [
      { role: 'user', content: message },
    ];

    let finalResponse = '';

    for (let i = 0; i < MAX_TOOL_CALLS_PER_MESSAGE; i++) {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
        tools: [
          {
            name: 'get_month_summary',
            description: 'Get monthly income, expenses, savings, and transaction count',
            input_schema: {
              type: 'object',
              properties: {
                month: {
                  type: 'string',
                  description: 'Month in YYYY-MM format',
                },
              },
              required: ['month'],
            },
          },
          {
            name: 'get_budget_status',
            description: 'Get budget status for all categories in a month',
            input_schema: {
              type: 'object',
              properties: {
                month: {
                  type: 'string',
                  description: 'Month in YYYY-MM format',
                },
              },
              required: ['month'],
            },
          },
          {
            name: 'get_category_trend',
            description: 'Compare category spending between current and previous month',
            input_schema: {
              type: 'object',
              properties: {
                month: {
                  type: 'string',
                  description: 'Month in YYYY-MM format',
                },
              },
              required: ['month'],
            },
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        finalResponse = content.text;
        break;
      }

      if (content.type === 'tool_use') {
        const toolResult = await executeTool(content.name, content.input as any, userId, targetMonth);

        messages.push({
          role: 'assistant',
          content: [content],
        });

        messages.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: content.id,
              content: JSON.stringify(toolResult),
            },
          ],
        });
      }
    }

    // Update token count
    const userLimit = chatRateLimitMap.get(userId);
    if (userLimit) {
      userLimit.tokens += 1000; // Approximate token count
    }

    return Response.json({
      response: finalResponse || 'I was unable to generate a response. Please try again.',
    });
  } catch (error) {
    console.error('CHAT_API_ERROR', error);
    return Response.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

async function executeTool(toolName: string, input: any, userId: string, defaultMonth: string) {
  const month = input.month || defaultMonth;

  try {
    switch (toolName) {
      case 'get_month_summary':
        return await getMonthSummary(userId, month);
      case 'get_budget_status':
        return await getBudgetStatus(userId, month);
      case 'get_category_trend':
        return await getCategoryTrend(userId, month);
      default:
        return { error: 'Unknown tool' };
    }
  } catch (error) {
    console.error(`TOOL_ERROR: ${toolName}`, error);
    return { error: 'Tool execution failed' };
  }
}
