import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

const REASON_LABEL: Record<string, string> = {
  login: "ログイン",
  chat_post: "チャット投稿",
  event_join: "イベント参加",
  course_complete: "講座修了",
  challenge_achieved: "挑戦達成",
  admin_adjust: "運営による調整",
};

function formatRelative(date: Date) {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  return `${Math.floor(diffHour / 24)}日前`;
}

export default async function PointsPage() {
  const session = await requireMemberSession();

  const [history, balanceResult, allUsers] = await Promise.all([
    prisma.pointEvent.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.pointEvent.groupBy({ by: ["userId"], _sum: { amount: true }, where: { userId: session.user.id } }),
    prisma.pointEvent.groupBy({ by: ["userId"], _sum: { amount: true } }),
  ]);

  const balance = balanceResult[0]?._sum.amount ?? 0;

  const rankedIds = allUsers
    .map((u) => ({ userId: u.userId, total: u._sum.amount ?? 0 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const users = await prisma.user.findMany({
    where: { id: { in: rankedIds.map((r) => r.userId) } },
    select: { id: true, displayName: true },
  });
  const nameMap = new Map(users.map((u) => [u.id, u.displayName]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand-green-dark">IPPOS Point</h1>
        <p className="mt-2 text-4xl font-bold text-brand-green">{balance}pt</p>
      </div>

      <section>
        <h2 className="mb-3 text-base font-bold text-brand-green-dark">獲得履歴</h2>
        {history.length === 0 ? (
          <p className="rounded-card border border-dashed border-brand-beige bg-white py-8 text-center text-sm text-brand-green-light">
            まだポイント履歴がありません
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <Card key={h.id}>
                <CardBody className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-green-dark">{REASON_LABEL[h.reason] ?? h.reason}</p>
                    <p className="text-xs text-brand-green-light">{formatRelative(h.createdAt)}</p>
                  </div>
                  <Badge tone={h.amount >= 0 ? "green" : "danger"}>{h.amount >= 0 ? `+${h.amount}` : h.amount}pt</Badge>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-brand-green-dark">🏆 ランキング TOP10</h2>
        <Card>
          <CardBody>
            <ol className="divide-y divide-brand-beige">
              {rankedIds.map((r, i) => (
                <li key={r.userId} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="flex items-center gap-3">
                    <span className="w-5 font-bold text-brand-green-light">{i + 1}</span>
                    {nameMap.get(r.userId) ?? "名無しさん"}
                  </span>
                  <span className="font-semibold text-brand-green">{r.total}pt</span>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
