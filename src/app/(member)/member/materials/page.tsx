import { notFound } from "next/navigation";
import { requireMemberSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { canViewContent } from "@/lib/permissions";
import { Card, CardBody } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function MaterialListPage() {
  notFound(); // 現在この機能は非公開です

  const session = await requireMemberSession();
  const plan = session.user.membershipPlan;

  const materials = await prisma.downloadMaterial.findMany({
    where: { isPublished: true, deletedAt: null },
    orderBy: { publishedAt: "desc" },
  });
  const visible = materials.filter((m) => canViewContent(plan, m.allowedPlans));

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-brand-green-dark">ダウンロード資料</h1>

      {visible.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          現在ダウンロードできる資料はありません
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((m) => (
            <Card key={m.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-brand-green-dark">{m.title}</h3>
                  {m.description && <p className="mt-1 text-xs text-brand-green-light">{m.description}</p>}
                  <p className="mt-1 text-xs text-brand-green-light">ダウンロード数: {m.downloadCount}</p>
                </div>
                {/* 実ファイルURLは秘匿し、ログイン必須のAPIルート経由でのみ配信する */}
                <a
                  href={`/api/materials/${m.id}/download`}
                  className="shrink-0 rounded-card bg-brand-green px-4 py-2 text-xs font-bold text-white hover:bg-brand-green-dark"
                >
                  ダウンロード
                </a>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
