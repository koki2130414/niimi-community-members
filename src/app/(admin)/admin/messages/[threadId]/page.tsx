import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminMessageThreadPage({ params }: { params: { threadId: string } }) {
  await requireAdminSession();

  const thread = await prisma.dmThread.findUnique({
    where: { id: params.threadId },
    include: { participants: { include: { user: { select: { displayName: true } } } } },
  });
  if (!thread) notFound();

  const messages = await prisma.dmMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { displayName: true } } },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-brand-green-dark">
          {thread.participants.map((p) => p.user.displayName).join(" ⇄ ")}
        </h1>
        <p className="mt-1 text-xs text-brand-green-light">閲覧専用（管理者による監視画面）</p>
      </div>

      <div className="space-y-4 rounded-card border border-brand-beige bg-white p-4">
        {messages.length === 0 && <p className="py-10 text-center text-sm text-brand-green-light">まだメッセージがありません</p>}
        {messages.map((m) => (
          <div key={m.id}>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-brand-green-dark">{m.sender.displayName}</span>
              <span className="text-[11px] text-brand-green-light">{formatDateTime(m.createdAt)}</span>
            </div>
            <p className="mt-0.5 whitespace-pre-wrap text-sm text-brand-green-dark">{m.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
