import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { deleteMaterial } from "@/lib/actions/admin-material-actions";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { MaterialCreateForm } from "@/components/admin/MaterialCreateForm";

export const dynamic = "force-dynamic";

export default async function AdminMaterialsPage() {
  await requireAdminSession();
  const materials = await prisma.downloadMaterial.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-brand-green-dark">資料管理</h1>
        <div className="space-y-2">
          {materials.map((m) => (
            <Card key={m.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <div>
                  <Badge tone={m.isPublished ? "green" : "neutral"}>{m.isPublished ? "公開中" : "非公開"}</Badge>
                  <p className="mt-1 text-sm font-bold text-brand-green-dark">{m.title}</p>
                  <p className="text-xs text-brand-green-light">
                    {m.fileName} ／ ダウンロード数: {m.downloadCount}
                  </p>
                </div>
                <DeleteButton id={m.id} />
              </CardBody>
            </Card>
          ))}
          {materials.length === 0 && <p className="text-sm text-brand-green-light">資料はまだ登録されていません</p>}
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-base font-bold text-brand-green-dark">新規資料アップロード</h2>
        <Card>
          <CardBody>
            <MaterialCreateForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  async function action() {
    "use server";
    await deleteMaterial(id);
  }
  return (
    <form action={action}>
      <ConfirmSubmitButton confirmMessage="この資料を削除します。よろしいですか？">削除</ConfirmSubmitButton>
    </form>
  );
}
