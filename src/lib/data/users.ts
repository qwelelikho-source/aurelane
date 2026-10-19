import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// This file is server-only
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server');
}

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
});

export async function createUser(data: unknown) {
  const parsed = registerSchema.parse(data);
  const passwordHash = await bcrypt.hash(parsed.password, 10);

  const user = await prisma.user.create({
    data: {
      email: parsed.email,
      name: parsed.name,
      passwordHash,
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}
