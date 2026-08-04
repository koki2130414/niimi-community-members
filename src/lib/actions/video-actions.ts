"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { canViewContent } from "@/lib/permissions";

/** 動画視聴済みを記録する。権限がない動画には記録しない（IDの直接指定対策） */
export async function markVideoViewed(videoId: string) {
  const session = await requireMemberSession();
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video || video.deletedAt || !video.isPublished) return;
  if (!canViewContent(session.user.membershipPlan, video.allowedPlans)) return;

  await prisma.videoView.upsert({
    where: { userId_videoId: { userId: session.user.id, videoId } },
    update: { viewedAt: new Date() },
    create: { userId: session.user.id, videoId },
  });
}

export async function toggleVideoFavorite(videoId: string) {
  const session = await requireMemberSession();
  const existing = await prisma.videoFavorite.findUnique({
    where: { userId_videoId: { userId: session.user.id, videoId } },
  });

  if (existing) {
    await prisma.videoFavorite.delete({ where: { id: existing.id } });
  } else {
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video || video.deletedAt || !video.isPublished) return;
    if (!canViewContent(session.user.membershipPlan, video.allowedPlans)) return;
    await prisma.videoFavorite.create({ data: { userId: session.user.id, videoId } });
  }

  revalidatePath(`/member/videos/${videoId}`);
  revalidatePath("/member/mypage");
}
