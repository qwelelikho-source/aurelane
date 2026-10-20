import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid URL'),
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
});

// Validate environment variables at server startup
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const error = parsed.error;
  const errors = error.issues.map((e) => e.message).join('\n');
  throw new Error(
    `Missing or invalid environment variables:\n${errors}\n\n` +
    `To fix this:\n` +
    `1. Copy .env.example to .env:\n` +
    `   PowerShell: Copy-Item .env.example .env\n` +
    `   Bash: cp .env.example .env\n` +
    `2. Fill in the values from your Neon dashboard and generate AUTH_SECRET\n` +
    `3. Restart the dev server`
  );
}

export const env = parsed.data;
