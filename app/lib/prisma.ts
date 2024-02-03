import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

export const getPrismaInstance = (): PrismaClient => {
  if (prisma == null) {
    prisma = new PrismaClient();
  }
  return prisma;
};
