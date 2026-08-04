import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-helpers";
import { formatDate, formatDateTime } from "@/lib/format";
import { Card, CardBody } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const soonThreshold = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const [
    totalMembers,
    activeMembers,
    newThisMonth,
    recentLogins,
    videoViewCount,
    articleViewCount,
    expiringMembers,
    unpublishedVideos,
    unpublishedArticles,
    unpublishedAnnouncements,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null, membershipPlan: { not: "ADMIN" } } }),
    prisma.user.count({ where: { deletedAt: null, status: "ACTIVE", membershipPlan: { not: "ADMIN" } } }),
    prisma.user.count({
      where: { deletedAt: null, membershipPlan: { not: "ADMIN" }, registeredAt: { gte: startOfMonth } },
    }),
    prisma.user.findMany({
      where: { deletedAt: null, lastLoginAt: { not: null } },
      orderBy: { lastLoginAt: "desc" },
      take: 5,
    }),
    prisma.videoView.count(),
    prisma.articleView.count(),
    prisma.user.findMany({
      where: { deletedAt: null, expiresAt: { not: null, lte: soonThreshold, gte: now } },
      orderBy: { expiresAt: "asc" },
      take: 5,
    }),
    prisma.video.count({ where: { isPublished: false, deletedAt: null } }),
    prisma.article.count({ where: { isPublished: false, deletedAt: null } }),
    prisma.announcement.count({ where: { isPublished: false, deletedAt: null } }),
  ]);

  const stats = [
    { label: "総会員数", value: totalMembers },
    { label: "有効会員数", value: activeMembers },
    { label: "今月の新規会員数", value: newThisMonth },
    { label: "動画視聴数（累計）", value: videoViewCount },
    { label: "記事閲覧数（累計）", value: articleViewCount },
    { label: "未公開コンテンツ数", value: unpublishedVideos + unpublishedArticles + unpublishedAnnouncements },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-brand-green-dark">管理ダッシュボード</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardBody>
              <p className="text-xs text-brand-green-light">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-brand-green-dark">{s.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-base font-bold text-brand-green-dark">最近ログインした会員</h2>
          <Card>
            <CardBody className="divide-y divide-brand-beige p-0">
              {recentLogins.length === 0 ? (
                <p className="p-4 text-sm text-brand-green-light">ログイン履歴はありません</p>
              ) : (
                recentLogins.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 text-sm">
                    <Link href={`/admin/members/${u.id}/edit`} className="font-medium text-brand-green-dark hover:text-brand-gold">
                      {u.displayName}
                    </Link>
                    <span className="text-xs text-brand-green-light">{u.lastLoginAt && formatDateTime(u.lastLoginAt)}</span>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-base font-bold text-brand-green-dark">有効期限が近い会員（14日以内）</h2>
          <Card>
            <CardBody className="divide-y divide-brand-beige p-0">
              {expiringMembers.length === 0 ? (
                <p className="p-4 text-sm text-brand-green-light">該当する会員はいません</p>
              ) : (
                expiringMembers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 text-sm">
                    <Link href={`/admin/members/${u.id}/edit`} className="font-medium text-brand-green-dark hover:text-brand-gold">
                      {u.displayName}
                    </Link>
                    <span className="text-xs text-brand-danger">{u.expiresAt && formatDate(u.expiresAt)}</span>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </section>
      </div>
    </div>
  );
}
