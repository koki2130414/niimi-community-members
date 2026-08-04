import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { deleteBenefit } from "@/lib/actions/admin-benefit-actions";
import { benefitDisplayLabel } from "@/lib/content-status";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { BenefitCreateForm } from "@/components/admin/BenefitCreateForm";

export const dynamic = "force-dynamic";

export default async function AdminBenefitsPage() {
  await requireAdminSession();
  const benefits = await prisma.benefit.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-brand-green-dark">特典管理</h1>
        <div className="space-y-2">
          {benefits.map((b) => (
            <Card key={b.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <div>
                  <Badge tone={benefitDisplayLabel(b.isPublished, b.validUntil) === "終了" ? "danger" : "green"}>
                    {benefitDisplayLabel(b.isPublished, b.validUntil)}
                  </Badge>
                  <p className="mt-1 text-sm font-bold text-brand-green-dark">{b.title}</p>
                </div>
                <DeleteButton id={b.id} />
              </CardBody>
            </Card>
          ))}
          {benefits.length === 0 && <p className="text-sm text-brand-green-light">特典はまだ登録されていません</p>}
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-base font-bold text-brand-green-dark">新規特典登録</h2>
        <Card>
          <CardBody>
            <BenefitCreateForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  async function action() {
    "use server";
    await deleteBenefit(id);
  }
  return (
    <form action={action}>
      <ConfirmSubmitButton confirmMessage="この特典を削除します。よろしいですか？">削除</ConfirmSubmitButton>
    </form>
  );
}
