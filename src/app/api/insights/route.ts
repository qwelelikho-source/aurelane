import 'server-only';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { monthToDate } from '@/lib/date-utils';
import { generateInsightSummary } from '@/lib/insights/summary';
import { generateAIInsight, generateFallbackInsight } from '@/lib/ai/insights';
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_PER_HOUR = 10;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_PER_HOUR) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
  const refresh = searchParams.get('refresh') === 'true';

  try {
    monthToDate(month);
  } catch {
    return NextResponse.json({ error: 'INVALID_MONTH', fields: { month: 'Invalid month format' } }, { status: 400 });
  }

  // Check if user has AI enabled
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiEnabled: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const monthDate = monthToDate(month);

  // Check for cached insight
  const cachedInsight = await prisma.insight.findUnique({
    where: {
      userId_month: {
        userId,
        month: monthDate,
      },
    },
  });

  if (cachedInsight && !refresh) {
    return NextResponse.json({
      status: cachedInsight.status,
      headline: cachedInsight.headline,
      observations: JSON.parse(cachedInsight.observations),
      suggestion: cachedInsight.suggestion,
      generatedAt: cachedInsight.generatedAt,
      cached: true,
    });
  }

  // Rate limit AI calls
  if (user.aiEnabled && !checkRateLimit(userId)) {
    return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 });
  }

  // Generate insight summary from rules engine
  const summary = await generateInsightSummary(userId, month);

  let insight;
  if (user.aiEnabled) {
    // Try AI generation
    const aiInsight = await generateAIInsight(summary);
    insight = aiInsight || generateFallbackInsight(summary);
  } else {
    // Use rules engine only
    insight = generateFallbackInsight(summary);
  }

  // Cache the insight
  await prisma.insight.upsert({
    where: {
      userId_month: {
        userId,
        month: monthDate,
      },
    },
    update: {
      status: insight.status,
      headline: insight.headline,
      observations: JSON.stringify(insight.observations),
      suggestion: insight.suggestion,
      generatedAt: new Date(),
    },
    create: {
      userId,
      month: monthDate,
      status: insight.status,
      headline: insight.headline,
      observations: JSON.stringify(insight.observations),
      suggestion: insight.suggestion,
      generatedAt: new Date(),
    },
  });

  return NextResponse.json({
    ...insight,
    generatedAt: new Date(),
    cached: false,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { aiEnabled } = body;

    if (typeof aiEnabled !== 'boolean') {
      return NextResponse.json({ error: 'VALIDATION', fields: { aiEnabled: 'Must be a boolean' } }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { aiEnabled },
    });

    return NextResponse.json({ success: true, aiEnabled });
  } catch {
    return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
  }
}
