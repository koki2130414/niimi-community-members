import { prisma } from "@/lib/db";

// サービス名を「管理画面から変更しやすい」設計にするため、
// ハードコードせず SiteSetting テーブルから読み出す。
// テーブルに値が無い場合は環境変数 / デフォルト文言にフォールバックする。

const DEFAULT_SITE_NAME = "にいみコミュニティ メンバーズ";

export async function getSiteName(): Promise<string> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: "site.name" } });
    return setting?.value || process.env.NEXT_PUBLIC_SITE_NAME || DEFAULT_SITE_NAME;
  } catch {
    // DB未接続時（ビルド時など）でもページが壊れないようフォールバックする
    return process.env.NEXT_PUBLIC_SITE_NAME || DEFAULT_SITE_NAME;
  }
}

export async function setSiteName(name: string): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: "site.name" },
    update: { value: name },
    create: { key: "site.name", value: name },
  });
}

// Podcast（Spotify番組の埋め込み）
// URLごとまるごと保存し、表示側でIDを抽出する（open.spotify.com/show/xxxx?si=... の形式を許容）
const DEFAULT_SPOTIFY_SHOW_URL = "https://open.spotify.com/show/033PE6bPNIaClUmTUWS2Yu";

export async function getPodcastSpotifyShowUrl(): Promise<string> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: "podcast.spotifyShowUrl" } });
    return setting?.value || DEFAULT_SPOTIFY_SHOW_URL;
  } catch {
    return DEFAULT_SPOTIFY_SHOW_URL;
  }
}

export async function setPodcastSpotifyShowUrl(url: string): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: "podcast.spotifyShowUrl" },
    update: { value: url },
    create: { key: "podcast.spotifyShowUrl", value: url },
  });
}

/** SpotifyのURLから埋め込み用のshow IDを抽出する */
export function extractSpotifyShowId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("spotify.com")) return null;
    const match = parsed.pathname.match(/\/show\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
