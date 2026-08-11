import Link from "next/link";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

const DOMAIN_LABEL: Record<string, string> = { ai: "AI講座", psychology: "心理学", agriculture: "農業" };

export default async function AdminCoursesPage() {
  await requireAdminSession();
  const courses = await prisma.course.findMany({
    orderBy: [{ domain: "asc" }, { sortOrder: "asc" }],
    include: { _count: { select: { lessons: true } } },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-green-dark">講座管理</h1>
        <Link href="/admin/courses/new">
          <Button>+ 新規講座作成</Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          講座がまだありません
        </p>
      ) : (
        <div className="space-y-2">
          {courses.map((c) => (
            <Link key={c.id} href={`/admin/courses/${c.id}/edit`}>
              <Card className="transition hover:border-brand-gold">
                <CardBody className="flex items-center justify-between">
                  <div>
                    <Badge tone="neutral">{DOMAIN_LABEL[c.domain] ?? c.domain}</Badge>
                    <p className="mt-1 text-sm font-bold text-brand-green-dark">{c.title}</p>
                    <p className="text-xs text-brand-green-light">{c._count.lessons}レッスン</p>
                  </div>
                  <Badge tone={c.isPublished ? "green" : "neutral"}>{c.isPublished ? "公開中" : "下書き"}</Badge>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
