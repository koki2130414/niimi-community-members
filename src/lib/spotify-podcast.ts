export interface SpotifyEpisode {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  releaseLabel: string | null;
  durationLabel: string | null;
}

/**
 * SpotifyのSSRされた番組ページHTMLからエピソード一覧を取得する。
 * 公式APIキーを使わない簡易実装のため、Spotify側のマークアップ変更で
 * 動かなくなる可能性がある。失敗時は空配列を返し、呼び出し側で
 * 埋め込みプレイヤーへフォールバックできるようにする。
 */
export async function fetchSpotifyShowEpisodes(showId: string): Promise<SpotifyEpisode[]> {
  try {
    const res = await fetch(`https://open.spotify.com/show/${showId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; IPPOSBot/1.0)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const html = await res.text();

    // Spotify の SSR ページには Next.js の初期状態 JSON が埋め込まれていることが多い。
    // 見つからない場合は正規表現でエピソードリンクとタイトルを直接抽出する。
    const episodes = extractFromJsonBlob(html) ?? extractFromHtmlPattern(html);
    return episodes;
  } catch {
    return [];
  }
}

function extractFromJsonBlob(html: string): SpotifyEpisode[] | null {
  const match = html.match(/<script id="initial-state"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    const data = JSON.parse(match[1]);
    const items: any[] = data?.entities?.episodes ? Object.values(data.entities.episodes) : [];
    if (items.length === 0) return null;
    return items.map((ep: any) => ({
      id: ep.id ?? ep.uri?.split(":").pop() ?? "",
      title: ep.name ?? "",
      description: (ep.description ?? "").slice(0, 200),
      imageUrl: ep.coverArt?.sources?.[0]?.url ?? null,
      releaseLabel: ep.releaseDate?.isoString ?? null,
      durationLabel: ep.duration?.totalMilliseconds
        ? `${Math.round(ep.duration.totalMilliseconds / 60000)}分`
        : null,
    }));
  } catch {
    return null;
  }
}

function extractFromHtmlPattern(html: string): SpotifyEpisode[] {
  const episodes: SpotifyEpisode[] = [];
  const linkPattern = /href="\/episode\/([a-zA-Z0-9]+)"[^>]*>\s*(?:<[^>]+>)*\s*([^<]{2,150})/g;
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = linkPattern.exec(html)) !== null) {
    const id = m[1];
    const title = m[2].trim();
    if (!id || !title || seen.has(id)) continue;
    seen.add(id);
    episodes.push({ id, title, description: "", imageUrl: null, releaseLabel: null, durationLabel: null });
  }
  return episodes;
}
