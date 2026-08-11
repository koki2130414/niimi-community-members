import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { Card, CardBody } from "@/components/ui/Card";
import { postDailyStep, cheerDailyStep } from "@/lib/actions/ippos-actions";

export const dynamic = "force-dynamic";

function formatRelative(date: Date) {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  return `${Math.floor(diffHour / 24)}日前`;
}

export default async function StepsPage() {
  notFound(); // 現在この機能は非公開です

  const session = await requireMemberSession();

  const steps = await prisma.dailyStep.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { displayName: true } }, cheers: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand-green-dark">今日の一歩</h1>
        <p className="mt-1 text-sm text-brand-green-light">小さな一歩を記録して、みんなで応援し合いましょう。</p>
      </div>

      <form action={postDailyStep} className="flex gap-2">
        <input
          name="body"
          required
          placeholder="今日できたことを書く"
          className="flex-1 rounded-full border border-brand-beige px-4 py-2.5 text-sm outline-none focus:border-brand-green"
        />
        <button type="submit" className="rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark">
          投稿
        </button>
      </form>

      {steps.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          まだ投稿がありません
        </p>
      ) : (
        <div className="space-y-3">
          {steps.map((s) => {
            const cheered = s.cheers.some((c) => c.userId === session.user.id);
            const cheerAction = async () => {
              "use server";
              await cheerDailyStep(s.id);
            };
            return (
              <Card key={s.id}>
                <CardBody>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-brand-green-dark">{s.user.displayName}</span>
                    <span className="text-[11px] text-brand-green-light">{formatRelative(s.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-brand-green-dark">{s.body}</p>
                  <form action={cheerAction} className="mt-2">
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        cheered ? "bg-brand-gold-light text-brand-green-dark" : "bg-brand-cream text-brand-green-light"
                      }`}
                    >
                      👏 応援する {s.cheers.length > 0 && s.cheers.length}
                    </button>
                  </form>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
