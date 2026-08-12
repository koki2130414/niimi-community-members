import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createCheckInPost, toggleCheckInLike, deleteCheckInPost } from "@/lib/actions/checkin-actions";
import { BlogSubmitForm } from "@/components/member/BlogSubmitForm";

export const dynamic = "force-dynamic";

function formatRelative(date: Date) {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  return `${Math.floor(diffHour / 24)}日前`;
}

export default async function CheckInPage() {
  const session = await requireMemberSession();

  const [posts, myRecentArticles] = await Promise.all([
    prisma.checkInPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { author: { select: { displayName: true } }, likes: true },
    }),
    prisma.article.findMany({
      where: { authorId: session.user.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-brand-green-dark">ブログ投稿</h1>
        <p className="mt-1 text-sm text-brand-green-light">日々の気づきをシェアしたり、ブログ記事を投稿したりできます。</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-brand-green-dark">📝 ブログを投稿する</h2>
        <Card>
          <CardBody>
            <BlogSubmitForm />
          </CardBody>
        </Card>
        {myRecentArticles.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-brand-green-light">投稿したブログ</p>
            {myRecentArticles.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-brand-beige bg-white px-3 py-2 text-sm">
                <span className="text-brand-green-dark">{a.title}</span>
                <Badge tone="green">公開中</Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-brand-green-dark">💬 情報をシェアする</h2>
        <form action={createCheckInPost} className="flex gap-2">
          <input
            name="body"
            required
            placeholder="今日の気づきや共有したい情報を書く"
            className="flex-1 rounded-full border border-brand-beige px-4 py-2.5 text-sm outline-none focus:border-brand-green"
          />
          <button type="submit" className="rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark">
            投稿
          </button>
        </form>

        {posts.length === 0 ? (
          <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
            まだ投稿がありません
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => {
              const liked = p.likes.some((l) => l.userId === session.user.id);
              const isMine = p.authorId === session.user.id;
              const likeAction = async () => {
                "use server";
                await toggleCheckInLike(p.id);
              };
              const deleteAction = async () => {
                "use server";
                await deleteCheckInPost(p.id);
              };
              return (
                <Card key={p.id}>
                  <CardBody>
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-brand-green-dark">{p.author.displayName}</span>
                        <span className="text-[11px] text-brand-green-light">{formatRelative(p.createdAt)}</span>
                      </div>
                      {isMine && (
                        <form action={deleteAction}>
                          <button type="submit" className="text-[11px] text-brand-danger hover:opacity-80">
                            削除
                          </button>
                        </form>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-brand-green-dark">{p.body}</p>
                    <form action={likeAction} className="mt-2">
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          liked ? "bg-brand-gold-light text-brand-green-dark" : "bg-brand-cream text-brand-green-light"
                        }`}
                      >
                        👍 いいね {p.likes.length > 0 && p.likes.length}
                      </button>
                    </form>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
