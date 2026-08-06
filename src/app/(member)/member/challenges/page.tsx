import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createChallenge, supportChallenge, markChallengeAchieved } from "@/lib/actions/ippos-actions";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ChallengesPage() {
  const session = await requireMemberSession();

  const challenges = await prisma.challenge.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { displayName: true } }, supports: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand-green-dark">挑戦宣言</h1>
        <p className="mt-1 text-sm text-brand-green-light">今月の目標を宣言して、仲間から応援をもらいましょう。</p>
      </div>

      <Card>
        <CardBody>
          <form action={createChallenge} className="space-y-3">
            <input
              name="title"
              required
              placeholder="今月の目標"
              className="w-full rounded-lg border border-brand-beige px-3.5 py-2.5 text-sm outline-none focus:border-brand-green"
            />
            <textarea
              name="description"
              rows={2}
              placeholder="詳細（任意）"
              className="w-full rounded-lg border border-brand-beige px-3.5 py-2.5 text-sm outline-none focus:border-brand-green"
            />
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-brand-green-dark">期限</label>
              <input
                type="date"
                name="deadline"
                required
                className="rounded-lg border border-brand-beige px-3.5 py-2 text-sm outline-none focus:border-brand-green"
              />
              <button type="submit" className="ml-auto rounded-full bg-brand-green px-5 py-2 text-xs font-semibold text-white hover:bg-brand-green-dark">
                宣言する
              </button>
            </div>
          </form>
        </CardBody>
      </Card>

      {challenges.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          挑戦宣言がまだありません
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {challenges.map((c) => {
            const supported = c.supports.some((s) => s.userId === session.user.id);
            const isOwner = c.userId === session.user.id;
            const supportAction = async () => {
              "use server";
              await supportChallenge(c.id);
            };
            const achieveAction = async () => {
              "use server";
              await markChallengeAchieved(c.id);
            };
            return (
              <Card key={c.id}>
                <CardBody>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-brand-green-light">{c.user.displayName}</span>
                    {c.isAchieved && <Badge tone="gold">達成 🎉</Badge>}
                  </div>
                  <p className="mt-2 text-sm font-bold text-brand-green-dark">{c.title}</p>
                  <p className="mt-1 text-xs text-brand-green-light">{c.description}</p>
                  <p className="mt-2 text-[11px] text-brand-green-light">期限: {formatDate(c.deadline)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <form action={supportAction}>
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          supported ? "bg-brand-gold-light text-brand-green-dark" : "bg-brand-cream text-brand-green-light"
                        }`}
                      >
                        🔥 応援する {c.supports.length > 0 && c.supports.length}
                      </button>
                    </form>
                    {isOwner && !c.isAchieved && (
                      <form action={achieveAction}>
                        <button type="submit" className="rounded-full bg-brand-beige px-3 py-1 text-xs font-semibold text-brand-green-dark hover:bg-brand-gold-light">
                          達成にする
                        </button>
                      </form>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
