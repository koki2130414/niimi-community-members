import { notFound } from "next/navigation";
import { requireMemberSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { canViewContent } from "@/lib/permissions";
import { EVENT_STATUS_LABELS } from "@/lib/content-status";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const session = await requireMemberSession();
  const plan = session.user.membershipPlan;

  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event || event.deletedAt || !canViewContent(plan, event.allowedPlans)) {
    notFound();
  }

  const canApply = event.status === "OPEN" && event.applyUrl;

  return (
    <div className="space-y-4">
      <Badge tone={event.status === "OPEN" ? "gold" : "neutral"}>{EVENT_STATUS_LABELS[event.status]}</Badge>
      <h1 className="text-xl font-bold text-brand-green-dark">{event.title}</h1>
      {event.eyecatchUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.eyecatchUrl} alt={event.title} className="w-full rounded-card object-cover" />
      )}

      <dl className="space-y-2 rounded-card border border-brand-beige bg-white p-4 text-sm">
        <Row label="開催日時" value={formatDateTime(event.startsAt) + (event.endsAt ? ` 〜 ${formatDateTime(event.endsAt)}` : "")} />
        {event.location && <Row label="開催場所" value={event.location} />}
        {event.onlineUrl && (
          <div>
            <dt className="font-semibold text-brand-green-dark">オンライン参加URL</dt>
            <dd>
              <a href={event.onlineUrl} target="_blank" rel="noopener noreferrer" className="text-brand-green underline break-all">
                {event.onlineUrl}
              </a>
            </dd>
          </div>
        )}
        {event.capacity != null && <Row label="定員" value={`${event.capacity}名`} />}
        {event.fee && <Row label="参加費" value={event.fee} />}
        {event.applyDeadline && <Row label="申込期限" value={formatDateTime(event.applyDeadline)} />}
      </dl>

      {event.summary && <p className="whitespace-pre-wrap text-sm text-brand-green-dark">{event.summary}</p>}

      {canApply && (
        <a
          href={event.applyUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-card bg-brand-green px-4 py-3 text-center text-sm font-bold text-white hover:bg-brand-green-dark"
        >
          このイベントに申し込む（外部フォームに移動します）
        </a>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-brand-green-dark">{label}</dt>
      <dd className="text-brand-green-light">{value}</dd>
    </div>
  );
}
