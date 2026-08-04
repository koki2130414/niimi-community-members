"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth-helpers";
import { setSiteName } from "@/lib/site-settings";
import { recordAdminLog } from "@/lib/admin-log";

const schema = z.object({
  siteName: z.string().min(1, "サービス名を入力してください").max(100),
});

export type SiteSettingsFormState = { error?: string; success?: boolean };

export async function updateSiteSettings(
  _prev: SiteSettingsFormState,
  formData: FormData
): Promise<SiteSettingsFormState> {
  const session = await requireAdminSession();
  const parsed = schema.safeParse({ siteName: formData.get("siteName") });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };
  }

  await setSiteName(parsed.data.siteName);
  await recordAdminLog({ actorId: session.user.id, action: "site_setting.update", detail: { siteName: parsed.data.siteName } });

  revalidatePath("/", "layout");
  return { success: true };
}
