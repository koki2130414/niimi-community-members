import { notFound } from "next/navigation";
import { requireMemberSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { canViewContent } from "@/lib/permissions";
import { benefitDisplayLabel } from "@/lib/content-status";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function BenefitDetailPage({ params }: { params: { id: string } }) {
  notFound(); // 現在この機能は非公開です

  const session = await requireMemberSession();
  const plan = session.user.membershipPlan;

  const benefit = await prisma.benefit.findUnique({ where: { id: params.id } });
  if (!benefit || benefit.deletedAt || !benefit.isPublished || !canViewContent(plan, benefit.allowedPlans)) {
    notFound();
  }

  const label = benefitDisplayLabel(benefit.isPublished, benefit.validUntil);

  return (
    <div className="space-y-4">
      <Badge tone={label === "終了" ? "danger" : "gold"}>{label}</Badge>
      <h1 className="text-xl font-bold text-brand-green-dark">{benefit.title}</h1>
      {benefit.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={benefit.imageUrl} alt={benefit.title} className="w-full rounded-card object-cover" />
      )}
      {benefit.summary && <p className="text-sm text-brand-green-dark">{benefit.summary}</p>}
      {benefit.detailHtml && <p className="whitespace-pre-wrap text-sm text-brand-green-dark">{benefit.detailHtml}</p>}

      <dl className="space-y-2 rounded-card border border-brand-beige bg-white p-4 text-sm">
        {benefit.conditions && (
          <div>
            <dt className="font-semibold text-brand-green-dark">利用条件</dt>
            <dd className="text-brand-green-light">{benefit.conditions}</dd>
          </div>
        )}
        {benefit.howTo && (
          <div>
            <dt className="font-semibold text-brand-green-dark">利用方法</dt>
            <dd className="text-brand-green-light">{benefit.howTo}</dd>
          </div>
        )}
        {benefit.couponCode && label !== "終了" && (
          <div>
            <dt className="font-semibold text-brand-green-dark">クーポンコード</dt>
            <dd className="rounded bg-brand-beige px-2 py-1 font-mono text-brand-green-dark inline-block">{benefit.couponCode}</dd>
          </div>
        )}
        {benefit.validUntil && (
          <div>
            <dt className="font-semibold text-brand-green-dark">利用期限</dt>
            <dd className="text-brand-green-light">{formatDate(benefit.validUntil)}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
