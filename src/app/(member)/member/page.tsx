import Link from "next/link";
import { requireMemberSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { canViewContent } from "@/lib/permissions";
import { ContentCard } from "@/components/member/ContentCard";
import { formatDate } from "@/lib/format";
import { getPointBalance } from "@/lib/points";

export const dynamic = "force-dynamic";

export default async function MemberHomePage() {
  const session = await requireMemberSession();
  const plan = session.user.membershipPlan;

  const [videos, articles, events, pointBalance] = await Promise.all([
    prisma.video.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: { publishedAt: "desc" },
      take: 8,
    }),
    prisma.article.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: { publishedAt: "desc" },
      take: 8,
    }),
    prisma.event.findMany({
      where: { deletedAt: null, status: { in: ["UPCOMING", "OPEN"] } },
      orderBy: { startsAt: "asc" },
      take: 4,
    }),
    getPointBalance(session.user.id),
  ]);

  const visibleVideos = videos.filter((v) => canViewContent(plan, v.allowedPlans)).slice(0, 4);
  const visibleArticles = articles.filter((a) => canViewContent(plan, a.allowedPlans)).slice(0, 4);
  const visibleEvents = events.filter((e) => canViewContent(plan, e.allowedPlans));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-brand-green-dark">
          {session.user.displayName}さん、こんにちは
        </h1>
        <p className="mt-1 text-sm text-brand-green-light">今日も会員限定コンテンツをお楽しみください。</p>
      </div>

      <Link
        href="/member/points"
        className="flex items-center justify-between rounded-card border border-brand-beige bg-white p-4 transition hover:border-brand-gold"
      >
        <div>
          <p className="text-xs font-semibold text-brand-green-light">IPPOS Point</p>
          <p className="text-2xl font-bold text-brand-green">{pointBalance}pt</p>
        </div>
        <span className="text-xs font-semibold text-brand-green">履歴・ランキングを見る →</span>
      </Link>

      <SectionMenu />

      <Section title="新着動画" moreHref="/member/videos" empty={visibleVideos.length === 0}>
        <CardGrid>
          {visibleVideos.map((v) => (
            <ContentCard
              key={v.id}
              href={`/member/videos/${v.id}`}
              imageUrl={v.thumbnailUrl}
              title={v.title}
              dateLabel={v.publishedAt ? formatDate(v.publishedAt) : undefined}
              isFeatured={v.isFeatured}
            />
          ))}
        </CardGrid>
      </Section>

      <Section title="新着ブログ記事" moreHref="/member/articles" empty={visibleArticles.length === 0}>
        <CardGrid>
          {visibleArticles.map((a) => (
            <ContentCard
              key={a.id}
              href={`/member/articles/${a.id}`}
              imageUrl={a.eyecatchUrl}
              title={a.title}
              subtitle={a.summary}
              dateLabel={a.publishedAt ? formatDate(a.publishedAt) : undefined}
              isFeatured={a.isFeatured}
            />
          ))}
        </CardGrid>
      </Section>

      <Section title="開催予定イベント" moreHref="/member/events" empty={visibleEvents.length === 0}>
        <CardGrid>
          {visibleEvents.map((e) => (
            <ContentCard
              key={e.id}
              href={`/member/events/${e.id}`}
              imageUrl={e.eyecatchUrl}
              title={e.title}
              dateLabel={formatDate(e.startsAt)}
              badgeText={e.location ?? undefined}
            />
          ))}
        </CardGrid>
      </Section>
    </div>
  );
}

function SectionMenu() {
  const items = [
    { href: "/member/videos", label: "動画", icon: "🎬" },
    { href: "/member/articles", label: "ブログ", icon: "📝" },
    { href: "/member/events", label: "イベント", icon: "📅" },
    { href: "/member/chat", label: "チャット", icon: "💬" },
    { href: "/member/messages", label: "メッセージ", icon: "✉️" },
    { href: "/member/points", label: "ポイント", icon: "⭐" },
    { href: "/member/courses/ai", label: "AI講座", icon: "🤖" },
    { href: "/member/challenges", label: "挑戦宣言", icon: "🎯" },
    { href: "/member/podcast", label: "Podcast", icon: "🎙️" },
    { href: "https://book-step-kappa.vercel.app/home", label: "BOOK STEP", icon: "📚", external: true },
  ];
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {items.map((item) =>
        item.external ? (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 rounded-card border border-brand-beige bg-white py-3 text-xs font-semibold text-brand-green-dark hover:border-brand-gold"
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </a>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 rounded-card border border-brand-beige bg-white py-3 text-xs font-semibold text-brand-green-dark hover:border-brand-gold"
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        )
      )}
    </div>
  );
}

function Section({
  title,
  moreHref,
  empty,
  children,
}: {
  title: string;
  moreHref: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-brand-green-dark">{title}</h2>
        <Link href={moreHref} className="text-xs font-semibold text-brand-green hover:text-brand-gold">
          もっと見る →
        </Link>
      </div>
      {empty ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-6 text-center text-sm text-brand-green-light">
          現在表示できるコンテンツはありません
        </p>
      ) : (
        children
      )}
    </section>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{children}</div>;
}
