import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = { intern: "インターン", "part-time": "アルバイト", contract: "業務委託", "full-time": "正社員" };

export default async function JobsListPage() {
  await requireMemberSession();

  const jobs = await prisma.jobPost.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-brand-green-dark">求人</h1>

      {jobs.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          現在募集中の求人はありません
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((j) => (
            <Link key={j.id} href={`/member/jobs/${j.id}`}>
              <Card className="h-full transition hover:shadow-md">
                <CardBody>
                  <Badge tone="neutral">{TYPE_LABEL[j.employmentType] ?? j.employmentType}</Badge>
                  <p className="mt-2 text-sm font-bold text-brand-green-dark">{j.title}</p>
                  <p className="mt-1 text-xs text-brand-green-light">
                    {j.companyName}
                    {j.location ? ` ・ ${j.location}` : ""}
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
