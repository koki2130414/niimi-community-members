import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { MemberEditForm } from "@/components/admin/MemberEditForm";
import { IssueTempPasswordButton } from "@/components/admin/IssueTempPasswordButton";
import { MemberStatusToggleButton } from "@/components/admin/MemberStatusToggleButton";
import { Card, CardBody } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AdminMemberEditPage({ params }: { params: { id: string } }) {
  await requireAdminSession();

  const member = await prisma.user.findUnique({
    where: { id: params.id },
    include: { profile: true },
  });
  if (!member || member.deletedAt) notFound();

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-green-dark">会員編集</h1>
        <Link href="/admin/members" className="text-xs font-semibold text-brand-green hover:text-brand-gold">
          ← 一覧に戻る
        </Link>
      </div>

      <Card>
        <CardBody>
          <MemberEditForm
            id={member.id}
            name={member.name}
            displayName={member.displayName}
            email={member.email}
            membershipPlan={member.membershipPlan}
            status={member.status}
            expiresAt={member.expiresAt ? member.expiresAt.toISOString().slice(0, 10) : ""}
            adminNote={member.profile?.adminNote ?? ""}
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-sm font-bold text-brand-green-dark">アカウント操作</h2>
          <p className="text-xs text-brand-green-light">
            セキュリティ上、管理者は会員のパスワードを閲覧できません。パスワード再設定は仮パスワードの発行のみ可能です。
          </p>
          <IssueTempPasswordButton userId={member.id} />
          <MemberStatusToggleButton userId={member.id} isActive={member.status === "ACTIVE"} />
          <Link
            href={`/admin/members/${member.id}/delete`}
            className="inline-block text-xs font-semibold text-brand-danger underline"
          >
            この会員を削除（退会）する
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
