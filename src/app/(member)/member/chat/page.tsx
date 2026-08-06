import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";

const DEFAULT_CHANNELS = [
  { slug: "general", name: "全体", description: "コミュニティ全体のお知らせ・雑談", sortOrder: 1 },
  { slug: "ai", name: "AI", description: "ChatGPT・Claude等の活用talk", sortOrder: 2 },
  { slug: "psychology", name: "心理学", description: "心理学の学びと実践", sortOrder: 3 },
  { slug: "agriculture", name: "農業", description: "農業に関する情報交換", sortOrder: 4 },
  { slug: "soccer", name: "サッカー", description: "サッカー好きが集まる場所", sortOrder: 5 },
  { slug: "random", name: "雑談", description: "自由な雑談スペース", sortOrder: 6 },
];

export default async function ChatIndexPage() {
  await requireMemberSession();

  const count = await prisma.chatChannel.count();
  if (count === 0) {
    await prisma.chatChannel.createMany({ data: DEFAULT_CHANNELS, skipDuplicates: true });
  }

  redirect("/member/chat/general");
}
