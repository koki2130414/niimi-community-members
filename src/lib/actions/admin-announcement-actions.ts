"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-helpers";
import { serializeAllowedPlans, type MembershipPlan } from "@/lib/permissions";
import { recordAdminLog } from "@/lib/admin-log";

const schema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(200),
  bodyHtml: z.string().min(1, "本文を入力してください"),
  importance: z.enum(["NORMAL", "IMPORTANT"]),
  isPublished: z.boolean(),
  allowedPlans: z.array(z.enum(["FREE", "STANDARD", "PREMIUM", "ADMIN"])).min(1),
});

export type AnnouncementFormState = { error?: string };

export async function createAnnouncement(_prev: AnnouncementFormState, formData: FormData): Promise<AnnouncementFormState> {
  const session = await requireAdminSession();
  const parsed = schema.safeParse({
    title: formData.get("title"),
    bodyHtml: formData.get("bodyHtml"),
    importance: formData.get("importance") ?? "NORMAL",
    isPublished: formData.get("isPublished") === "on",
    allowedPlans: formData.getAll("allowedPlans") as MembershipPlan[],
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };

  const announcement = await prisma.announcement.create({
    data: {
      title: parsed.data.title,
      bodyHtml: parsed.data.bodyHtml,
      importance: parsed.data.importance,
      isPublished: parsed.data.isPublished,
      allowedPlans: serializeAllowedPlans(parsed.data.allowedPlans),
      publishedAt: parsed.data.isPublished ? new Date() : null,
    },
  });

  await recordAdminLog({ actorId: session.user.id, action: "announcement.create", targetType: "Announcement", targetId: announcement.id });
  revalidatePath("/admin/announcements");
  return {};
}

export async function deleteAnnouncement(id: string) {
  const session = await requireAdminSession();
  await prisma.announcement.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });
  await recordAdminLog({ actorId: session.user.id, action: "announcement.delete", targetType: "Announcement", targetId: id });
  revalidatePath("/admin/announcements");
}
