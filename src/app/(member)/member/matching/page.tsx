import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createMatchingPost } from "@/lib/actions/ippos-actions";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  designer: "デザイナー募集",
  engineer: "エンジニア募集",
  "farm-experience": "農業体験",
  "co-founder": "共同創業者募集",
  other: "その他",
};

function formatRelative(date: Date) {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  return `${Math.floor(diffHour / 24)}日前`;
}

export default async function MatchingPage() {
  await requireMemberSession();

  const posts = await prisma.matchingPost.findMany({
    where: { status: "open", deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { displayName: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand-green-dark">マッチング</h1>
        <p className="mt-1 text-sm text-brand-green-light">仲間を探す・見つける掲示板です。</p>
      </div>

      <Card>
        <CardBody>
          <form action={createMatchingPost} className="space-y-3">
            <input
              name="title"
              required
              placeholder="募集タイトル"
              className="w-full rounded-lg border border-brand-beige px-3.5 py-2.5 text-sm outline-none focus:border-brand-green"
            />
            <div className="grid grid-cols-2 gap-3">
              <select name="category" className="rounded-lg border border-brand-beige px-3.5 py-2.5 text-sm outline-none focus:border-brand-green">
                {Object.entries(CATEGORY_LABEL).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
              <button type="submit" className="rounded-full bg-brand-green px-5 py-2 text-xs font-semibold text-white hover:bg-brand-green-dark">
                投稿する
              </button>
            </div>
            <textarea
              name="description"
              rows={2}
              placeholder="詳細"
              className="w-full rounded-lg border border-brand-beige px-3.5 py-2.5 text-sm outline-none focus:border-brand-green"
            />
          </form>
        </CardBody>
      </Card>

      {posts.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          募集がまだありません
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((p) => (
            <Card key={p.id}>
              <CardBody>
                <Badge tone="neutral">{CATEGORY_LABEL[p.category] ?? p.category}</Badge>
                <p className="mt-2 text-sm font-bold text-brand-green-dark">{p.title}</p>
                <p className="mt-1 text-xs text-brand-green-light">{p.description}</p>
                <p className="mt-3 text-xs text-brand-green-light">
                  {p.author.displayName} ・ {formatRelative(p.createdAt)}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
