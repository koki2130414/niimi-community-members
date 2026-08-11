import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { toggleFavoriteEpisode } from "@/lib/actions/ippos-actions";
import { getPodcastSpotifyShowUrl, extractSpotifyShowId } from "@/lib/site-settings";
import { fetchSpotifyShowEpisodes } from "@/lib/spotify-podcast";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("ja-JP", { month: "long", day: "numeric" }).format(new Date(iso));
  } catch {
    return null;
  }
}

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
  const spotifyEpisodes = spotifyShowId ? await fetchSpotifyShowEpisodes(spotifyShowId) : [];

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
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="新見康樹のPodcast（Spotify）"
          />
        </div>
      )}

      {spotifyEpisodes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-brand-green-dark">全エピソード一覧（{spotifyEpisodes.length}件）</h2>
          <div className="space-y-2">
            {spotifyEpisodes.map((ep) => {
              const dateLabel = formatDate(ep.releaseLabel);
              return (
                <a
                  key={ep.id}
                  href={`https://open.spotify.com/episode/${ep.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <Card className="transition hover:border-brand-gold">
                    <CardBody className="flex items-center gap-3">
                      {ep.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ep.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-brand-green-dark">{ep.title}</p>
                        {ep.description && <p className="mt-0.5 line-clamp-1 text-xs text-brand-green-light">{ep.description}</p>}
                        <p className="mt-0.5 text-[11px] text-brand-green-light">
                          {dateLabel}
                          {ep.durationLabel ? ` ・ ${ep.durationLabel}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-lg">▶</span>
                    </CardBody>
                  </Card>
                </a>
              );
            })}
          </div>
        </section>
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
