import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { requireMemberSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { canViewContent } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import { markAnnouncementRead } from "@/lib/actions/announcement-actions";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AnnouncementDetailPage({ params }: { params: { id: string } }) {
  const session = await requireMemberSession();
  const plan = session.user.membershipPlan;

  const announcement = await prisma.announcement.findUnique({ where: { id: params.id } });
  if (!announcement || announcement.deletedAt || !announcement.isPublished || !canViewContent(plan, announcement.allowedPlans)) {
    notFound();
  }

  await markAnnouncementRead(announcement.id);

  const safeHtml = DOMPurify.sanitize(announcement.bodyHtml, {
    ALLOWED_TAGS: ["p", "strong", "em", "ul", "ol", "li", "a", "br"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

  return (
    <article className="space-y-4">
      <div className="flex items-center gap-2">
        {announcement.importance === "IMPORTANT" && <Badge tone="gold">重要</Badge>}
        {announcement.publishedAt && <span className="text-xs text-brand-green-light">{formatDate(announcement.publishedAt)}</span>}
      </div>
      <h1 className="text-xl font-bold text-brand-green-dark">{announcement.title}</h1>
      <div className="prose-article" dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </article>
  );
}
