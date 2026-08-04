import { requireMemberSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { canViewContent } from "@/lib/permissions";
import { EVENT_STATUS_LABELS } from "@/lib/content-status";
import { ContentCard } from "@/components/member/ContentCard";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EventListPage() {
  const session = await requireMemberSession();
  const plan = session.user.membershipPlan;

  const events = await prisma.event.findMany({
    where: { deletedAt: null },
    orderBy: { startsAt: "asc" },
  });
  const visible = events.filter((e) => canViewContent(plan, e.allowedPlans));

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-brand-green-dark">イベント情報</h1>

      {visible.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          現在予定されているイベントはありません
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {visible.map((e) => (
            <ContentCard
              key={e.id}
              href={`/member/events/${e.id}`}
              imageUrl={e.eyecatchUrl}
              title={e.title}
              dateLabel={formatDateTime(e.startsAt)}
              badgeText={EVENT_STATUS_LABELS[e.status]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
