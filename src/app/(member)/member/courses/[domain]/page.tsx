import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

const DOMAIN_LABEL: Record<string, string> = { ai: "AI講座", psychology: "心理学", agriculture: "農業" };

export default async function CourseDomainPage({ params }: { params: { domain: string } }) {
  const domain = params.domain;
  if (!DOMAIN_LABEL[domain]) notFound();

  const session = await requireMemberSession();

  const [courses, progress] = await Promise.all([
    prisma.course.findMany({ where: { domain, isPublished: true }, orderBy: { sortOrder: "asc" } }),
    prisma.courseProgress.findMany({ where: { userId: session.user.id } }),
  ]);
  const progressMap = new Map(progress.map((p) => [p.courseId, p.progressPercent]));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-brand-green">講座</p>
        <h1 className="text-xl font-bold text-brand-green-dark">{DOMAIN_LABEL[domain]}</h1>
      </div>

      {courses.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          準備中です。この分野の講座は近日公開予定です
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <Link key={c.id} href={`/member/courses/${domain}/${c.id}`}>
              <Card className="h-full transition hover:shadow-md">
                <CardBody className="flex items-center justify-between">
                  <div className="pr-4">
                    <p className="text-sm font-bold text-brand-green-dark">{c.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-brand-green-light">{c.description}</p>
                    <div className="mt-2">
                      <Badge tone="gold">+{c.pointsOnComplete}pt</Badge>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-brand-green">{progressMap.get(c.id) ?? 0}%</span>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
