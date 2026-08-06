import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { sendDmMessage } from "@/lib/actions/ippos-actions";

export const dynamic = "force-dynamic";

function formatRelative(date: Date) {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  return `${Math.floor(diffHour / 24)}日前`;
}

export default async function DmThreadPage({ params }: { params: { threadId: string } }) {
  const session = await requireMemberSession();

  const thread = await prisma.dmThread.findUnique({
    where: { id: params.threadId },
    include: {
      participants: { include: { user: { select: { id: true, displayName: true } } } },
    },
  });
  if (!thread) notFound();

  const isParticipant = thread.participants.some((p) => p.userId === session.user.id);
  if (!isParticipant) notFound();

  const other = thread.participants.find((p) => p.userId !== session.user.id)?.user;

  const messages = await prisma.dmMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  const postAction = async (formData: FormData) => {
    "use server";
    await sendDmMessage(thread!.id, formData);
  };

  return (
    <div className="flex h-[calc(100vh-11rem)] flex-col md:h-[calc(100vh-8rem)]">
      <h1 className="mb-3 text-xl font-bold text-brand-green-dark">{other?.displayName ?? "退会した会員"}さんとのメッセージ</h1>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-card border border-brand-beige bg-white p-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-brand-green-light">まだメッセージがありません。最初の一言を送ってみましょう。</p>
        )}
        {messages.map((m) => {
          const isMe = m.senderId === session.user.id;
          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe ? "bg-brand-green text-white" : "bg-brand-cream text-brand-green-dark"}`}>
                <p className="whitespace-pre-wrap text-sm">{m.body}</p>
                <p className={`mt-1 text-[10px] ${isMe ? "text-white/70" : "text-brand-green-light"}`}>{formatRelative(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <form action={postAction} className="mt-3 flex gap-2">
        <input
          name="body"
          required
          placeholder="メッセージを送る"
          className="flex-1 rounded-full border border-brand-beige px-4 py-2.5 text-sm outline-none focus:border-brand-green"
        />
        <button type="submit" className="rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark">
          送信
        </button>
      </form>

      <p className="mt-2 text-center text-[11px] text-brand-green-light">
        ※ このメッセージは運営（管理者）が閲覧できます。個人情報の取り扱いにご注意ください。
      </p>
    </div>
  );
}
