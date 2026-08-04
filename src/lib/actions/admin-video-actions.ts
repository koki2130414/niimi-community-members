"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-helpers";
import { videoUpsertSchema, extractYoutubeId } from "@/lib/validators";
import { serializeAllowedPlans, type MembershipPlan } from "@/lib/permissions";
import { recordAdminLog } from "@/lib/admin-log";

export type VideoFormState = { error?: string };

function parseAllowedPlansFromForm(formData: FormData): MembershipPlan[] {
  return formData.getAll("allowedPlans") as MembershipPlan[];
}

export async function createVideo(_prev: VideoFormState, formData: FormData): Promise<VideoFormState> {
  const session = await requireAdminSession();

  const parsed = videoUpsertSchema.safeParse({
    title: formData.get("title"),
    youtubeUrl: formData.get("youtubeUrl"),
    description: formData.get("description") || undefined,
    categoryId: formData.get("categoryId") || null,
    tags: formData.get("tags") || undefined,
    isPublished: formData.get("isPublished") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    allowedPlans: parseAllowedPlansFromForm(formData),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };
  }

  const youtubeId = extractYoutubeId(parsed.data.youtubeUrl);
  if (!youtubeId) {
    return { error: "YouTube URLから動画IDを取得できませんでした。URLをご確認ください" };
  }

  const video = await prisma.video.create({
    data: {
      title: parsed.data.title,
      youtubeUrl: parsed.data.youtubeUrl,
      youtubeId,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId || null,
      tags: parsed.data.tags,
      isPublished: parsed.data.isPublished,
      isFeatured: parsed.data.isFeatured,
      allowedPlans: serializeAllowedPlans(parsed.data.allowedPlans),
      publishedAt: parsed.data.isPublished ? new Date() : null,
    },
  });

  if (parsed.data.isPublished) {
    await recordAdminLog({ actorId: session.user.id, action: "video.publish", targetType: "Video", targetId: video.id });
  }

  revalidatePath("/admin/videos");
  redirect("/admin/videos");
}

export async function updateVideo(id: string, _prev: VideoFormState, formData: FormData): Promise<VideoFormState> {
  const session = await requireAdminSession();

  const parsed = videoUpsertSchema.safeParse({
    title: formData.get("title"),
    youtubeUrl: formData.get("youtubeUrl"),
    description: formData.get("description") || undefined,
    categoryId: formData.get("categoryId") || null,
    tags: formData.get("tags") || undefined,
    isPublished: formData.get("isPublished") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    allowedPlans: parseAllowedPlansFromForm(formData),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };
  }

  const youtubeId = extractYoutubeId(parsed.data.youtubeUrl);
  if (!youtubeId) {
    return { error: "YouTube URLから動画IDを取得できませんでした。URLをご確認ください" };
  }

  const existing = await prisma.video.findUnique({ where: { id } });
  const nowPublishing = parsed.data.isPublished && existing && !existing.isPublished;

  await prisma.video.update({
    where: { id },
    data: {
      title: parsed.data.title,
      youtubeUrl: parsed.data.youtubeUrl,
      youtubeId,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId || null,
      tags: parsed.data.tags,
      isPublished: parsed.data.isPublished,
      isFeatured: parsed.data.isFeatured,
      allowedPlans: serializeAllowedPlans(parsed.data.allowedPlans),
      publishedAt: parsed.data.isPublished ? existing?.publishedAt ?? new Date() : existing?.publishedAt,
    },
  });

  if (nowPublishing) {
    await recordAdminLog({ actorId: session.user.id, action: "video.publish", targetType: "Video", targetId: id });
  } else {
    await recordAdminLog({ actorId: session.user.id, action: "video.update", targetType: "Video", targetId: id });
  }

  revalidatePath("/admin/videos");
  revalidatePath(`/admin/videos/${id}/edit`);
  return {};
}

export async function deleteVideo(id: string) {
  const session = await requireAdminSession();
  await prisma.video.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });
  await recordAdminLog({ actorId: session.user.id, action: "video.delete", targetType: "Video", targetId: id });
  revalidatePath("/admin/videos");
}
