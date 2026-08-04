import { PrismaClient } from "@prisma/client";

// Next.jsの開発モードでのホットリロード時に PrismaClient が
// 何度も生成されコネクションが枯渇するのを防ぐための定番パターン。
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
