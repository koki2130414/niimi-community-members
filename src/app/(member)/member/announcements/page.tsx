import { notFound } from "next/navigation";
import Link from "next/link";
import { requireMemberSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { canViewContent } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AnnouncementListPage() {
  notFound(); // 現在この機能は非公開です

  const session = await requireMemberSession();
  const plan = session.user.membershipPlan;

  const [announcements, reads] = await Promise.all([
    prisma.announcement.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.announcementRead.findMany({ where: { userId: session.user.id } }),
  ]);
  const readIds = new Set(reads.map((r) => r.announcementId));
  const visible = announcements.filter((a) => canViewContent(plan, a.allowedPlans));

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-brand-green-dark">お知らせ一覧</h1>

      {visible.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          お知らせはありません
        </p>
      ) : (
        <div className="space-y-2">
          {visible.map((a) => {
            const isRead = readIds.has(a.id);
            return (
              <Link key={a.id} href={`/member/announcements/${a.id}`} className="block">
                <Card className={isRead ? "opacity-70" : ""}>
                  <CardBody className="flex items-center justify-between gap-3">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        {a.importance === "IMPORTANT" && <Badge tone="gold">重要</Badge>}
                        {!isRead && <Badge tone="green">未読</Badge>}
                      </div>
                      <h3 className="text-sm font-bold text-brand-green-dark">{a.title}</h3>
                      {a.publishedAt && <p className="mt-1 text-xs text-brand-green-light">{formatDate(a.publishedAt)}</p>}
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
