import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-helpers";
import { Card, CardBody } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

function formatRelative(date: Date) {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  return `${Math.floor(diffHour / 24)}日前`;
}

export default async function AdminMessagesPage() {
  await requireAdminSession();

  const threads = await prisma.dmThread.findMany({
    include: {
      participants: { include: { user: { select: { displayName: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
  });

  threads.sort((a, b) => {
    const aTime = a.messages[0]?.createdAt.getTime() ?? a.createdAt.getTime();
    const bTime = b.messages[0]?.createdAt.getTime() ?? b.createdAt.getTime();
    return bTime - aTime;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-brand-green-dark">メッセージ監視</h1>
        <p className="mt-1 text-sm text-brand-green-light">
          会員間のダイレクトメッセージを一覧できます。会員にはこの画面から閲覧可能である旨を案内しています。
        </p>
      </div>

      {threads.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          まだメッセージはありません
        </p>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => {
            const names = t.participants.map((p) => p.user.displayName).join(" ⇄ ");
            const lastMessage = t.messages[0];
            return (
              <Link key={t.id} href={`/admin/messages/${t.id}`}>
                <Card className="transition hover:border-brand-gold">
                  <CardBody className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-brand-green-dark">{names}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-brand-green-light">
                        {lastMessage?.body ?? "まだメッセージがありません"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] text-brand-green-light">{t._count.messages}件</p>
                      {lastMessage && <p className="text-[11px] text-brand-green-light">{formatRelative(lastMessage.createdAt)}</p>}
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
