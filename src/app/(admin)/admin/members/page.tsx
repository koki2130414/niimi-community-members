import Link from "next/link";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { PLAN_LABELS } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "有効",
  SUSPENDED: "一時停止",
  WITHDRAWN: "退会",
  EXPIRED: "有効期限切れ",
};

export default async function AdminMemberListPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; plan?: string };
}) {
  await requireAdminSession();

  const members = await prisma.user.findMany({
    where: {
      deletedAt: null,
      ...(searchParams.status ? { status: searchParams.status as never } : {}),
      ...(searchParams.plan ? { membershipPlan: searchParams.plan as never } : {}),
      ...(searchParams.q
        ? {
            OR: [
              { name: { contains: searchParams.q } },
              { displayName: { contains: searchParams.q } },
              { email: { contains: searchParams.q } },
              { loginId: { contains: searchParams.q } },
            ],
          }
        : {}),
    },
    orderBy: { registeredAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-green-dark">会員一覧</h1>
        <Link href="/admin/members/new">
          <Button>+ 新規会員登録</Button>
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" method="get">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q}
          placeholder="氏名・メール・ログインIDで検索"
          className="flex-1 min-w-[200px] rounded-lg border border-brand-beige px-3 py-2 text-sm"
        />
        <select name="status" defaultValue={searchParams.status ?? ""} className="rounded-lg border border-brand-beige px-3 py-2 text-sm">
          <option value="">すべてのステータス</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select name="plan" defaultValue={searchParams.plan ?? ""} className="rounded-lg border border-brand-beige px-3 py-2 text-sm">
          <option value="">すべての会員種別</option>
          {Object.entries(PLAN_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          絞り込み
        </Button>
      </form>

      <div className="overflow-x-auto rounded-card border border-brand-beige bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-beige bg-brand-cream text-xs text-brand-green-light">
            <tr>
              <th className="p-3">氏名 / 表示名</th>
              <th className="p-3">ログインID</th>
              <th className="p-3">会員種別</th>
              <th className="p-3">ステータス</th>
              <th className="p-3">登録日</th>
              <th className="p-3">最終ログイン</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-brand-beige last:border-0">
                <td className="p-3">
                  <div className="font-medium text-brand-green-dark">{m.name}</div>
                  <div className="text-xs text-brand-green-light">{m.displayName}</div>
                </td>
                <td className="p-3 text-xs">{m.loginId}</td>
                <td className="p-3">
                  <Badge tone={m.membershipPlan === "PREMIUM" ? "gold" : "neutral"}>{PLAN_LABELS[m.membershipPlan]}</Badge>
                </td>
                <td className="p-3">
                  <Badge tone={m.status === "ACTIVE" ? "green" : "danger"}>{STATUS_LABELS[m.status]}</Badge>
                </td>
                <td className="p-3 text-xs">{formatDate(m.registeredAt)}</td>
                <td className="p-3 text-xs">{m.lastLoginAt ? formatDate(m.lastLoginAt) : "-"}</td>
                <td className="p-3 text-right">
                  <Link href={`/admin/members/${m.id}/edit`} className="text-xs font-semibold text-brand-green hover:text-brand-gold">
                    編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && <p className="p-6 text-center text-sm text-brand-green-light">該当する会員がいません</p>}
      </div>
    </div>
  );
}
