import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
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

export default async function MessagesListPage() {
  const session = await requireMemberSession();

  const threads = await prisma.dmThread.findMany({
    where: { participants: { some: { userId: session.user.id } } },
    include: {
      participants: { include: { user: { select: { id: true, displayName: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { messages: { _count: "desc" } },
  });

  // 最新メッセージ順に並び替え（メッセージが無いスレッドは作成日時順で後ろへ）
  threads.sort((a, b) => {
    const aTime = a.messages[0]?.createdAt.getTime() ?? 0;
    const bTime = b.messages[0]?.createdAt.getTime() ?? 0;
    return bTime - aTime;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-green-dark">メッセージ</h1>
        <Link href="/member/messages/new" className="rounded-full bg-brand-green px-4 py-2 text-xs font-semibold text-white hover:bg-brand-green-dark">
          + 新しいメッセージ
        </Link>
      </div>

      {threads.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          まだメッセージはありません
        </p>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => {
            const other = t.participants.find((p) => p.userId !== session.user.id)?.user;
            const lastMessage = t.messages[0];
            return (
              <Link key={t.id} href={`/member/messages/${t.id}`}>
                <Card className="transition hover:border-brand-gold">
                  <CardBody className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-brand-green-dark">{other?.displayName ?? "退会した会員"}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-brand-green-light">{lastMessage?.body ?? "まだメッセージがありません"}</p>
                    </div>
                    {lastMessage && <span className="shrink-0 text-[11px] text-brand-green-light">{formatRelative(lastMessage.createdAt)}</span>}
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
