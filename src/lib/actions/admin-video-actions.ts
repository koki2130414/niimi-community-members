"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-helpers";
import { videoUpsertSchema, extractYoutubeId } from "@/lib/validators";
import { serializeAllowedPlans, type MembershipPlan } from "@/lib/permissions";
import { recordAdminLog } from "@/lib/admin-log";

export type VideoFormState = { error?: string };

function parseAllowedPlansFromForm(formData: FormData): MembershipPlan[] {
  return formData.getAll("allowedPlans") as MembershipPlan[];
}

function parseVideoForm(formData: FormData) {
  return videoUpsertSchema.safeParse({
    title: formData.get("title"),
    youtubeUrl: formData.get("youtubeUrl") || undefined,
    filePath: formData.get("filePath") || undefined,
    fileMimeType: formData.get("fileMimeType") || undefined,
    fileSizeBytes: formData.get("fileSizeBytes") || undefined,
    description: formData.get("description") || undefined,
    categoryId: formData.get("categoryId") || null,
    tags: formData.get("tags") || undefined,
    isPublished: formData.get("isPublished") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    allowedPlans: parseAllowedPlansFromForm(formData),
  });
}

export async function createVideo(formData: FormData): Promise<VideoFormState> {
  const session = await requireAdminSession();

  const parsed = parseVideoForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };
  }

  if (!parsed.data.filePath && !parsed.data.youtubeUrl) {
    return { error: "動画ファイルをアップロードしてください" };
  }

  const sourceType = parsed.data.filePath ? "upload" : "youtube";
  const youtubeId = parsed.data.youtubeUrl ? extractYoutubeId(parsed.data.youtubeUrl) : null;
  if (sourceType === "youtube" && !youtubeId) {
    return { error: "YouTube URLから動画IDを取得できませんでした。URLをご確認ください" };
  }

  const video = await prisma.video.create({
    data: {
      title: parsed.data.title,
      sourceType,
      youtubeUrl: parsed.data.youtubeUrl || null,
      youtubeId,
      filePath: parsed.data.filePath || null,
      fileMimeType: parsed.data.fileMimeType || null,
      fileSizeBytes: parsed.data.fileSizeBytes || null,
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
  return {};
}

export async function updateVideo(id: string, formData: FormData): Promise<VideoFormState> {
  const session = await requireAdminSession();

  const parsed = parseVideoForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };
  }

  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing) return { error: "動画が見つかりませんでした" };

  const hasNewFile = !!parsed.data.filePath;
  if (!hasNewFile && !existing.filePath && !parsed.data.youtubeUrl) {
    return { error: "動画ファイルをアップロードしてください" };
  }

  const sourceType = hasNewFile ? "upload" : existing.sourceType;
  const youtubeId = parsed.data.youtubeUrl ? extractYoutubeId(parsed.data.youtubeUrl) : existing.youtubeId;

  // 新しいファイルに差し替える場合、古いBlobは削除してストレージを無駄にしない
  if (hasNewFile && existing.filePath) {
    await del(existing.filePath).catch(() => {});
  }

  const nowPublishing = parsed.data.isPublished && !existing.isPublished;

  await prisma.video.update({
    where: { id },
    data: {
      title: parsed.data.title,
      sourceType,
      youtubeUrl: parsed.data.youtubeUrl || existing.youtubeUrl,
      youtubeId,
      filePath: hasNewFile ? parsed.data.filePath : existing.filePath,
      fileMimeType: hasNewFile ? parsed.data.fileMimeType : existing.fileMimeType,
      fileSizeBytes: hasNewFile ? parsed.data.fileSizeBytes : existing.fileSizeBytes,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId || null,
      tags: parsed.data.tags,
      isPublished: parsed.data.isPublished,
      isFeatured: parsed.data.isFeatured,
      allowedPlans: serializeAllowedPlans(parsed.data.allowedPlans),
      publishedAt: parsed.data.isPublished ? existing.publishedAt ?? new Date() : existing.publishedAt,
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
  const video = await prisma.video.findUnique({ where: { id } });
  await prisma.video.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });
  if (video?.filePath) {
    await del(video.filePath).catch(() => {});
  }
  await recordAdminLog({ actorId: session.user.id, action: "video.delete", targetType: "Video", targetId: id });
  revalidatePath("/admin/videos");
}
