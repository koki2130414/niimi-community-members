import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { postChatMessage, toggleChatReaction, pinChatMessage, deleteChatMessage } from "@/lib/actions/ippos-actions";

export const dynamic = "force-dynamic";

function formatRelative(date: Date) {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  return `${Math.floor(diffHour / 24)}日前`;
}

export default async function ChatChannelPage({ params }: { params: { slug: string } }) {
  const session = await requireMemberSession();
  const isAdmin = session.user.membershipPlan === "ADMIN";

  const [channels, channel] = await Promise.all([
    prisma.chatChannel.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.chatChannel.findUnique({ where: { slug: params.slug } }),
  ]);
  if (!channel) notFound();

  const messages = await prisma.chatMessage.findMany({
    where: { channelId: channel.id, deletedAt: null, parentId: null },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: {
      author: { select: { displayName: true } },
      reactions: true,
    },
  });

  const pinned = messages.find((m) => m.isPinned);

  const postAction = async (formData: FormData) => {
    "use server";
    await postChatMessage(channel!.id, channel!.slug, formData);
  };

  return (
    <div className="flex h-[calc(100vh-11rem)] flex-col md:h-[calc(100vh-8rem)]">
      <h1 className="mb-3 text-xl font-bold text-brand-green-dark">チャット</h1>
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {channels.map((c) => (
          <Link
            key={c.id}
            href={`/member/chat/${c.slug}`}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              c.slug === params.slug ? "bg-brand-green text-white" : "bg-brand-beige text-brand-green-dark"
            }`}
          >
            #{c.name}
          </Link>
        ))}
      </div>

      {pinned && (
        <div className="mb-3 rounded-card border border-brand-gold bg-brand-gold-light/40 p-3 text-xs text-brand-green-dark">
          📌 {pinned.body}
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto rounded-card border border-brand-beige bg-white p-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-brand-green-light">
            まだメッセージがありません。最初の一言を送ってみましょう。
          </p>
        )}
        {messages.map((m) => {
          const reactionCounts = new Map<string, number>();
          m.reactions.forEach((r) => reactionCounts.set(r.emoji, (reactionCounts.get(r.emoji) ?? 0) + 1));
          return (
            <div key={m.id}>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-brand-green-dark">{m.author.displayName}</span>
                <span className="text-[11px] text-brand-green-light">{formatRelative(m.createdAt)}</span>
                {m.isPinned && <span className="text-[11px] text-brand-gold">📌</span>}
              </div>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-brand-green-dark">{m.body}</p>
              <div className="mt-1 flex items-center gap-1.5">
                {["👍", "❤️", "🎉"].map((emoji) => {
                  const reactAction = async () => {
                    "use server";
                    await toggleChatReaction(m.id, emoji, channel!.slug);
                  };
                  return (
                    <form key={emoji} action={reactAction}>
                      <button type="submit" className="rounded-full bg-brand-cream px-2 py-0.5 text-xs hover:bg-brand-beige">
                        {emoji} {reactionCounts.get(emoji) ?? ""}
                      </button>
                    </form>
                  );
                })}
                {isAdmin && (
                  <>
                    <form
                      action={async () => {
                        "use server";
                        await pinChatMessage(m.id, channel!.slug, !m.isPinned);
                      }}
                    >
                      <button type="submit" className="text-[11px] text-brand-green-light hover:text-brand-green-dark">
                        {m.isPinned ? "固定解除" : "固定"}
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await deleteChatMessage(m.id, channel!.slug);
                      }}
                    >
                      <button type="submit" className="text-[11px] text-brand-danger hover:opacity-80">
                        削除
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form action={postAction} className="mt-3 flex gap-2">
        <input
          name="body"
          required
          placeholder={`#${channel.name} にメッセージを送る`}
          className="flex-1 rounded-full border border-brand-beige px-4 py-2.5 text-sm outline-none focus:border-brand-green"
        />
        <button type="submit" className="rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark">
          送信
        </button>
      </form>
    </div>
  );
}
