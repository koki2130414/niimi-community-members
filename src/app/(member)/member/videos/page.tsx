import { requireMemberSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { canViewContent } from "@/lib/permissions";
import { ContentCard } from "@/components/member/ContentCard";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function VideoListPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const session = await requireMemberSession();
  const plan = session.user.membershipPlan;

  const [videos, categories] = await Promise.all([
    prisma.video.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
        ...(searchParams.category ? { categoryId: searchParams.category } : {}),
        ...(searchParams.q
          ? {
              OR: [
                { title: { contains: searchParams.q } },
                { description: { contains: searchParams.q } },
                { tags: { contains: searchParams.q } },
              ],
            }
          : {}),
      },
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    }),
    prisma.videoCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const visibleVideos = videos.filter((v) => canViewContent(plan, v.allowedPlans));

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-brand-green-dark">動画一覧</h1>

      <form className="flex flex-col gap-2 sm:flex-row" method="get">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q}
          placeholder="キーワードで検索"
          className="flex-1 rounded-lg border border-brand-beige px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
        <select
          name="category"
          defaultValue={searchParams.category ?? ""}
          className="rounded-lg border border-brand-beige px-3 py-2 text-sm"
        >
          <option value="">すべてのカテゴリー</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green-dark"
        >
          検索
        </button>
      </form>

      {visibleVideos.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          該当する動画が見つかりませんでした
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {visibleVideos.map((v) => (
            <ContentCard
              key={v.id}
              href={`/member/videos/${v.id}`}
              imageUrl={v.thumbnailUrl}
              title={v.title}
              badgeText={v.category?.name}
              dateLabel={v.publishedAt ? formatDate(v.publishedAt) : undefined}
              isFeatured={v.isFeatured}
            />
          ))}
        </div>
      )}
    </div>
  );
}
