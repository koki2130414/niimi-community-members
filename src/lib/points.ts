import { prisma } from "@/lib/db";

/** IPPOS Point の付与ルール。 */
export const POINT_RULES = {
  login: 5,
  chat_post: 3,
  event_join: 50,
  course_complete: 30,
  challenge_achieved: 30,
} as const;

export type PointReason = keyof typeof POINT_RULES;

/** ポイントを付与し PointEvent に記録する。 */
export async function awardPoints(
  userId: string,
  reason: PointReason,
  ref?: { table: string; id: string },
) {
  const amount = POINT_RULES[reason];
  await prisma.pointEvent.create({
    data: { userId, amount, reason, refTable: ref?.table, refId: ref?.id },
  });
  return amount;
}

/** ユーザーの合計ポイントを取得する。 */
export async function getPointBalance(userId: string): Promise<number> {
  const result = await prisma.pointEvent.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}
