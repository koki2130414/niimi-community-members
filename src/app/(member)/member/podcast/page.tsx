import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { toggleFavoriteEpisode } from "@/lib/actions/ippos-actions";

export const dynamic = "force-dynamic";

export default async function PodcastPage() {
  const session = await requireMemberSession();

  const episodes = await prisma.podcastEpisode.findMany({
    orderBy: { publishedAt: "desc" },
    include: { series: true, favorites: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand-green-dark">Podcast</h1>
        <p className="mt-1 text-sm text-brand-green-light">新見康樹の一歩ラジオなどを、アプリ内でそのまま再生できます。</p>
      </div>

      {episodes.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          配信予定のエピソードはまだありません
        </p>
      ) : (
        <div className="space-y-3">
          {episodes.map((e) => {
            const favorited = e.favorites.some((f) => f.userId === session.user.id);
            const favAction = async () => {
              "use server";
              await toggleFavoriteEpisode(e.id);
            };
            return (
              <Card key={e.id}>
                <CardBody>
                  <Badge tone="neutral">{e.series.title}</Badge>
                  <div className="mt-1 flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-brand-green-dark">{e.title}</p>
                    <form action={favAction}>
                      <button type="submit" className="text-lg">
                        {favorited ? "⭐" : "☆"}
                      </button>
                    </form>
                  </div>
                  <p className="mt-1 text-xs text-brand-green-light">{e.description}</p>
                  <audio src={e.audioUrl} controls className="mt-3 w-full" />
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
