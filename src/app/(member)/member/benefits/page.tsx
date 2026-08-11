import { notFound } from "next/navigation";
import { requireMemberSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { canViewContent } from "@/lib/permissions";
import { benefitDisplayLabel } from "@/lib/content-status";
import { ContentCard } from "@/components/member/ContentCard";

export const dynamic = "force-dynamic";

export default async function BenefitListPage() {
  notFound(); // 現在この機能は非公開です

  const session = await requireMemberSession();
  const plan = session.user.membershipPlan;

  const benefits = await prisma.benefit.findMany({
    where: { isPublished: true, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  const visible = benefits.filter((b) => canViewContent(plan, b.allowedPlans));

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-brand-green-dark">お得な情報・会員限定特典</h1>

      {visible.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          現在ご案内できる特典はありません
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {visible.map((b) => {
            const label = benefitDisplayLabel(b.isPublished, b.validUntil);
            return (
              <ContentCard
                key={b.id}
                href={`/member/benefits/${b.id}`}
                imageUrl={b.imageUrl}
                title={b.title}
                subtitle={b.summary}
                badgeText={label === "終了" ? "終了" : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
