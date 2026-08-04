import Link from "next/link";
import { requireMemberSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { PLAN_LABELS } from "@/lib/permissions";
import { formatDate, formatDateTime } from "@/lib/format";
import { ProfileEditForm } from "@/components/member/ProfileEditForm";
import { Card, CardBody } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const session = await requireMemberSession();

  const [user, favoriteVideos, favoriteArticles, videoViews, articleViews] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    prisma.videoFavorite.findMany({
      where: { userId: session.user.id },
      include: { video: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.articleFavorite.findMany({
      where: { userId: session.user.id },
      include: { article: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.videoView.findMany({
      where: { userId: session.user.id },
      include: { video: true },
      orderBy: { viewedAt: "desc" },
      take: 10,
    }),
    prisma.articleView.findMany({
      where: { userId: session.user.id },
      include: { article: true },
      orderBy: { viewedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-brand-green-dark">マイページ</h1>
        <p className="mt-1 text-sm text-brand-green-light">
          {PLAN_LABELS[user.membershipPlan]} ／ 登録日: {formatDate(user.registeredAt)}
          {user.expiresAt && ` ／ 有効期限: ${formatDate(user.expiresAt)}`}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-base font-bold text-brand-green-dark">会員情報</h2>
        <Card>
          <CardBody>
            <ProfileEditForm defaultName={user.name} defaultDisplayName={user.displayName} defaultEmail={user.email} />
            <Link href="/member/mypage/password" className="mt-4 inline-block text-sm font-semibold text-brand-green hover:text-brand-gold">
              パスワードを変更する →
            </Link>
          </CardBody>
        </Card>
      </section>

      <HistorySection
        title="お気に入り動画"
        emptyText="お気に入り登録した動画はありません"
        items={favoriteVideos.map((f) => ({ id: f.video.id, href: `/member/videos/${f.video.id}`, title: f.video.title }))}
      />
      <HistorySection
        title="お気に入り記事"
        emptyText="お気に入り登録した記事はありません"
        items={favoriteArticles.map((f) => ({ id: f.article.id, href: `/member/articles/${f.article.id}`, title: f.article.title }))}
      />
      <HistorySection
        title="視聴履歴"
        emptyText="視聴した動画はまだありません"
        items={videoViews.map((v) => ({
          id: v.id,
          href: `/member/videos/${v.video.id}`,
          title: v.video.title,
          meta: formatDateTime(v.viewedAt),
        }))}
      />
      <HistorySection
        title="閲覧履歴"
        emptyText="閲覧した記事はまだありません"
        items={articleViews.map((v) => ({
          id: v.id,
          href: `/member/articles/${v.article.id}`,
          title: v.article.title,
          meta: formatDateTime(v.viewedAt),
        }))}
      />
    </div>
  );
}

function HistorySection({
  title,
  emptyText,
  items,
}: {
  title: string;
  emptyText: string;
  items: { id: string; href: string; title: string; meta?: string }[];
}) {
  return (
    <section>
      <h2 className="mb-3 text-base font-bold text-brand-green-dark">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-6 text-center text-sm text-brand-green-light">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="block">
              <Card>
                <CardBody className="flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-green-dark">{item.title}</span>
                  {item.meta && <span className="text-xs text-brand-green-light">{item.meta}</span>}
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
