import { notFound } from "next/navigation";
import { requireMemberSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { canViewContent } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import { markVideoViewed, toggleVideoFavorite } from "@/lib/actions/video-actions";
import { ContentCard } from "@/components/member/ContentCard";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function VideoDetailPage({ params }: { params: { id: string } }) {
  const session = await requireMemberSession();
  const plan = session.user.membershipPlan;

  const video = await prisma.video.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  // 未公開・削除済み・権限外のIDを直接指定された場合は404にする（不正閲覧対策）
  if (!video || video.deletedAt || !video.isPublished || !canViewContent(plan, video.allowedPlans)) {
    notFound();
  }

  await markVideoViewed(video.id);

  const favorite = await prisma.videoFavorite.findUnique({
    where: { userId_videoId: { userId: session.user.id, videoId: video.id } },
  });

  const [related, recommended] = await Promise.all([
    prisma.video.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
        id: { not: video.id },
        categoryId: video.categoryId ?? undefined,
      },
      take: 4,
    }),
    prisma.video.findMany({
      where: { isPublished: true, deletedAt: null, isFeatured: true, id: { not: video.id } },
      take: 4,
    }),
  ]);
  const visibleRelated = related.filter((v) => canViewContent(plan, v.allowedPlans));
  const visibleRecommended = recommended.filter((v) => canViewContent(plan, v.allowedPlans));

  const videoId = video.id;
  async function toggleFavoriteAction() {
    "use server";
    await toggleVideoFavorite(videoId);
  }

  return (
    <div className="space-y-6">
      <div className="aspect-video w-full overflow-hidden rounded-card bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${video.youtubeId}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {video.category && <Badge tone="neutral">{video.category.name}</Badge>}
          {video.isFeatured && <Badge tone="gold">おすすめ</Badge>}
          {video.publishedAt && <span className="text-xs text-brand-green-light">{formatDate(video.publishedAt)}</span>}
        </div>
        <h1 className="text-lg font-bold text-brand-green-dark">{video.title}</h1>
        {video.description && <p className="mt-2 whitespace-pre-wrap text-sm text-brand-green-dark">{video.description}</p>}

        <form action={toggleFavoriteAction} className="mt-4">
          <button
            type="submit"
            className={`rounded-card border px-4 py-2 text-sm font-semibold ${
              favorite
                ? "border-brand-gold bg-brand-gold-light text-brand-green-dark"
                : "border-brand-beige bg-white text-brand-green-dark"
            }`}
          >
            {favorite ? "★ お気に入り登録済み" : "☆ お気に入りに登録"}
          </button>
        </form>
      </div>

      <p className="rounded-card border border-brand-beige bg-brand-beige/40 p-3 text-xs text-brand-green-dark">
        ⚠️ この動画はYouTubeの限定公開機能を利用しています。URLを知っている第三者が視聴できる可能性があるため、会員限定情報の外部共有はお控えください。
      </p>

      {visibleRelated.length > 0 && (
        <VideoSection title="関連動画" videos={visibleRelated} />
      )}
      {visibleRecommended.length > 0 && (
        <VideoSection title="おすすめ動画" videos={visibleRecommended} />
      )}
    </div>
  );
}

function VideoSection({ title, videos }: { title: string; videos: { id: string; title: string; thumbnailUrl: string | null }[] }) {
  return (
    <section>
      <h2 className="mb-3 text-base font-bold text-brand-green-dark">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {videos.map((v) => (
          <ContentCard key={v.id} href={`/member/videos/${v.id}`} imageUrl={v.thumbnailUrl} title={v.title} />
        ))}
      </div>
    </section>
  );
}
