"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireMemberSession, requireAdminSession } from "@/lib/auth-helpers";
import { awardPoints } from "@/lib/points";

// ---------------- チャット ----------------
export async function postChatMessage(channelId: string, slug: string, formData: FormData) {
  const session = await requireMemberSession();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const msg = await prisma.chatMessage.create({
    data: { channelId, authorId: session.user.id, body },
  });
  await awardPoints(session.user.id, "chat_post", { table: "ChatMessage", id: msg.id });
  revalidatePath(`/member/chat/${slug}`);
}

export async function toggleChatReaction(messageId: string, emoji: string, slug: string) {
  const session = await requireMemberSession();
  const existing = await prisma.chatReaction.findUnique({
    where: { messageId_userId_emoji: { messageId, userId: session.user.id, emoji } },
  });
  if (existing) {
    await prisma.chatReaction.delete({
      where: { messageId_userId_emoji: { messageId, userId: session.user.id, emoji } },
    });
  } else {
    await prisma.chatReaction.create({ data: { messageId, userId: session.user.id, emoji } });
  }
  revalidatePath(`/member/chat/${slug}`);
}

export async function pinChatMessage(messageId: string, slug: string, pinned: boolean) {
  await requireAdminSession();
  await prisma.chatMessage.update({ where: { id: messageId }, data: { isPinned: pinned } });
  revalidatePath(`/member/chat/${slug}`);
}

export async function deleteChatMessage(messageId: string, slug: string) {
  await requireAdminSession();
  await prisma.chatMessage.update({ where: { id: messageId }, data: { deletedAt: new Date() } });
  revalidatePath(`/member/chat/${slug}`);
}

// ---------------- 一歩記録 ----------------
export async function postDailyStep(formData: FormData) {
  const session = await requireMemberSession();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  await prisma.dailyStep.create({ data: { userId: session.user.id, body } });
  revalidatePath("/member/steps");
}

export async function cheerDailyStep(stepId: string) {
  const session = await requireMemberSession();
  const existing = await prisma.dailyStepCheer.findUnique({
    where: { stepId_userId: { stepId, userId: session.user.id } },
  });
  if (existing) {
    await prisma.dailyStepCheer.delete({ where: { stepId_userId: { stepId, userId: session.user.id } } });
  } else {
    await prisma.dailyStepCheer.create({ data: { stepId, userId: session.user.id } });
  }
  revalidatePath("/member/steps");
}

// ---------------- 挑戦宣言 ----------------
export async function createChallenge(formData: FormData) {
  const session = await requireMemberSession();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const deadline = String(formData.get("deadline") ?? "");
  if (!title || !deadline) return;
  await prisma.challenge.create({
    data: { userId: session.user.id, title, description, deadline: new Date(deadline) },
  });
  revalidatePath("/member/challenges");
}

export async function supportChallenge(challengeId: string) {
  const session = await requireMemberSession();
  const existing = await prisma.challengeSupport.findUnique({
    where: { challengeId_userId: { challengeId, userId: session.user.id } },
  });
  if (existing) {
    await prisma.challengeSupport.delete({ where: { challengeId_userId: { challengeId, userId: session.user.id } } });
  } else {
    await prisma.challengeSupport.create({ data: { challengeId, userId: session.user.id } });
  }
  revalidatePath("/member/challenges");
}

export async function markChallengeAchieved(challengeId: string) {
  const session = await requireMemberSession();
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge || challenge.userId !== session.user.id || challenge.isAchieved) return;
  await prisma.challenge.update({
    where: { id: challengeId },
    data: { isAchieved: true, progressPercent: 100 },
  });
  await awardPoints(session.user.id, "challenge_achieved", { table: "Challenge", id: challengeId });
  revalidatePath("/member/challenges");
}

// ---------------- Podcast ----------------
export async function toggleFavoriteEpisode(episodeId: string) {
  const session = await requireMemberSession();
  const existing = await prisma.podcastFavorite.findUnique({
    where: { episodeId_userId: { episodeId, userId: session.user.id } },
  });
  if (existing) {
    await prisma.podcastFavorite.delete({ where: { episodeId_userId: { episodeId, userId: session.user.id } } });
  } else {
    await prisma.podcastFavorite.create({ data: { episodeId, userId: session.user.id } });
  }
  revalidatePath("/member/podcast");
}

// ---------------- マッチング ----------------
export async function createMatchingPost(formData: FormData) {
  const session = await requireMemberSession();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "other");
  const description = String(formData.get("description") ?? "").trim();
  if (!title) return;
  await prisma.matchingPost.create({ data: { authorId: session.user.id, title, category, description } });
  revalidatePath("/member/matching");
}

// ---------------- 求人 ----------------
export async function applyToJob(jobId: string, formData: FormData) {
  const session = await requireMemberSession();
  const message = String(formData.get("message") ?? "");
  await prisma.jobApplication.create({ data: { jobId, applicantId: session.user.id, message } });
  revalidatePath(`/member/jobs/${jobId}`);
}

// ---------------- イベント参加 ----------------
export async function toggleEventRsvp(eventId: string) {
  const session = await requireMemberSession();
  const existing = await prisma.eventRsvp.findUnique({
    where: { eventId_userId: { eventId, userId: session.user.id } },
  });
  if (existing?.status === "going") {
    await prisma.eventRsvp.update({
      where: { eventId_userId: { eventId, userId: session.user.id } },
      data: { status: "canceled" },
    });
  } else {
    await prisma.eventRsvp.upsert({
      where: { eventId_userId: { eventId, userId: session.user.id } },
      update: { status: "going" },
      create: { eventId, userId: session.user.id, status: "going" },
    });
    await awardPoints(session.user.id, "event_join", { table: "Event", id: eventId });
  }
  revalidatePath(`/member/events/${eventId}`);
}

// ---------------- 講座進捗 ----------------
export async function markLessonComplete(courseId: string, lessonId: string, totalLessons: number) {
  const session = await requireMemberSession();
  const existing = await prisma.courseProgress.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  const completed = new Set((existing?.completedLessonIds ?? "").split(",").filter(Boolean));
  completed.add(lessonId);
  const percent = totalLessons > 0 ? Math.round((completed.size / totalLessons) * 100) : 0;
  const nowComplete = percent >= 100 && !existing?.completedAt;

  await prisma.courseProgress.upsert({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    update: {
      completedLessonIds: Array.from(completed).join(","),
      progressPercent: percent,
      completedAt: percent >= 100 ? new Date() : existing?.completedAt ?? null,
    },
    create: {
      userId: session.user.id,
      courseId,
      completedLessonIds: Array.from(completed).join(","),
      progressPercent: percent,
      completedAt: percent >= 100 ? new Date() : null,
    },
  });

  if (nowComplete) {
    await awardPoints(session.user.id, "course_complete", { table: "Course", id: courseId });
  }
  revalidatePath(`/member/courses`);
}
