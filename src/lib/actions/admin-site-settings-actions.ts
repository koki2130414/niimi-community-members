"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { setSiteName, setPodcastSpotifyShowUrl, extractSpotifyShowId } from "@/lib/site-settings";
import { recordAdminLog } from "@/lib/admin-log";

/** 全会員のポイント履歴を削除し、全員のポイントを0にリセットする。取り消せないため管理者のみ実行可能。 */
export async function resetAllPoints() {
  const session = await requireAdminSession();
  const result = await prisma.pointEvent.deleteMany({});
  await recordAdminLog({
    actorId: session.user.id,
    action: "points.reset_all",
    detail: { deletedCount: result.count },
  });
  revalidatePath("/member", "layout");
  revalidatePath("/member/points");
  revalidatePath("/admin/points");
}

const schema = z.object({
  siteName: z.string().min(1, "サービス名を入力してください").max(100),
  spotifyShowUrl: z
    .string()
    .max(300)
    .optional()
    .refine((v) => !v || extractSpotifyShowId(v) !== null, "正しいSpotify番組のURLを入力してください（例：https://open.spotify.com/show/xxxx）"),
});

export type SiteSettingsFormState = { error?: string; success?: boolean };

export async function updateSiteSettings(
  _prev: SiteSettingsFormState,
  formData: FormData
): Promise<SiteSettingsFormState> {
  const session = await requireAdminSession();
  const parsed = schema.safeParse({
    siteName: formData.get("siteName"),
    spotifyShowUrl: formData.get("spotifyShowUrl") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };
  }

  await setSiteName(parsed.data.siteName);
  if (parsed.data.spotifyShowUrl) {
    await setPodcastSpotifyShowUrl(parsed.data.spotifyShowUrl);
  }
  await recordAdminLog({
    actorId: session.user.id,
    action: "site_setting.update",
    detail: { siteName: parsed.data.siteName, spotifyShowUrl: parsed.data.spotifyShowUrl },
  });

  revalidatePath("/", "layout");
  revalidatePath("/member/podcast");
  return { success: true };
}
