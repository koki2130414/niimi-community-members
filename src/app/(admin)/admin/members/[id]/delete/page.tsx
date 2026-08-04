import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { deleteMember } from "@/lib/actions/admin-member-actions";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function AdminMemberDeleteConfirmPage({ params }: { params: { id: string } }) {
  await requireAdminSession();

  const member = await prisma.user.findUnique({ where: { id: params.id } });
  if (!member || member.deletedAt) notFound();

  async function confirmDelete() {
    "use server";
    await deleteMember(params.id);
  }

  return (
    <div className="max-w-md space-y-5">
      <h1 className="text-xl font-bold text-brand-danger">会員削除の確認</h1>
      <Card>
        <CardBody className="space-y-4">
          <p className="text-sm text-brand-green-dark">
            「{member.name}（{member.displayName}）」さんを削除します。この操作により会員は退会扱いとなり、ログインできなくなります。
          </p>
          <p className="text-xs text-brand-green-light">
            ※データは即時に完全削除されるのではなく、論理削除（退会扱い）として保持されます。
          </p>
          <form action={confirmDelete}>
            <Button type="submit" variant="danger">
              削除を確定する
            </Button>
          </form>
          <a href={`/admin/members/${member.id}/edit`} className="block text-xs font-semibold text-brand-green-light hover:text-brand-green">
            キャンセルして戻る
          </a>
        </CardBody>
      </Card>
    </div>
  );
}
