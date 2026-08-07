import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { toggleFavoriteEpisode } from "@/lib/actions/ippos-actions";
import { getPodcastSpotifyShowUrl, extractSpotifyShowId } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function PodcastPage() {
  const session = await requireMemberSession();

  const [episodes, spotifyShowUrl] = await Promise.all([
    prisma.podcastEpisode.findMany({
      orderBy: { publishedAt: "desc" },
      include: { series: true, favorites: true },
    }),
    getPodcastSpotifyShowUrl(),
  ]);

  const spotifyShowId = extractSpotifyShowId(spotifyShowUrl);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand-green-dark">Podcast</h1>
        <p className="mt-1 text-sm text-brand-green-light">新見康樹のPodcastを、アプリ内でそのまま聴けます。</p>
      </div>

      {spotifyShowId && (
        <div className="overflow-hidden rounded-card shadow">
          <iframe
            src={`https://open.spotify.com/embed/show/${spotifyShowId}?utm_source=generator&theme=0`}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="新見康樹のPodcast（Spotify）"
          />
        </div>
      )}

      {episodes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-brand-green-dark">サイト内配信エピソード</h2>
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
        </section>
      )}
    </div>
  );
}
