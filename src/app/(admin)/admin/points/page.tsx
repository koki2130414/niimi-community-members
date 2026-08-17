import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { resetAllPoints } from "@/lib/actions/admin-site-settings-actions";
import { Card, CardBody } from "@/components/ui/Card";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminPointsPage() {
  await requireAdminSession();

  const totals = await prisma.pointEvent.groupBy({
    by: ["userId"],
    _sum: { amount: true },
  });
  const totalPointsInSystem = totals.reduce((sum, t) => sum + (t._sum.amount ?? 0), 0);
  const membersWithPoints = totals.filter((t) => (t._sum.amount ?? 0) !== 0).length;

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-xl font-bold text-brand-green-dark">ポイント管理</h1>

      <Card>
        <CardBody>
          <p className="text-sm text-brand-green-dark">
            現在、ポイントを保有している会員数: <span className="font-bold">{membersWithPoints}人</span>
          </p>
          <p className="mt-1 text-sm text-brand-green-dark">
            システム全体の合計ポイント: <span className="font-bold">{totalPointsInSystem}pt</span>
          </p>
        </CardBody>
      </Card>

      <Card className="border-brand-danger">
        <CardBody>
          <p className="text-sm font-bold text-brand-danger">全員のポイントを0にリセット</p>
          <p className="mt-1 text-xs text-brand-green-light">
            全会員のポイント獲得履歴をすべて削除し、全員0ptの状態に戻します。この操作は取り消せません。
          </p>
          <form action={resetAllPoints} className="mt-3">
            <ConfirmSubmitButton
              confirmMessage="本当に全会員のポイントを0にリセットしますか？この操作は取り消せません。"
              className="rounded-full bg-brand-danger px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              全員のポイントを0にリセットする
            </ConfirmSubmitButton>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
