"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-helpers";
import { serializeAllowedPlans, type MembershipPlan } from "@/lib/permissions";
import { extractYoutubeId } from "@/lib/validators";
import { recordAdminLog } from "@/lib/admin-log";

export type CourseFormState = { error?: string };

// ---------------- 講座本体 ----------------

export async function createCourse(formData: FormData): Promise<CourseFormState> {
  const session = await requireAdminSession();
  const title = String(formData.get("title") ?? "").trim();
  const domain = String(formData.get("domain") ?? "ai");
  if (!title) return { error: "タイトルを入力してください" };

  const course = await prisma.course.create({
    data: {
      title,
      domain,
      description: String(formData.get("description") ?? ""),
      isPublished: formData.get("isPublished") === "on",
      pointsOnComplete: Number(formData.get("pointsOnComplete") ?? 20),
    },
  });
  await recordAdminLog({ actorId: session.user.id, action: "course.create", targetType: "Course", targetId: course.id });
  revalidatePath("/admin/courses");
  return {};
}

export async function updateCourse(id: string, formData: FormData): Promise<CourseFormState> {
  const session = await requireAdminSession();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "タイトルを入力してください" };

  await prisma.course.update({
    where: { id },
    data: {
      title,
      description: String(formData.get("description") ?? ""),
      isPublished: formData.get("isPublished") === "on",
      pointsOnComplete: Number(formData.get("pointsOnComplete") ?? 20),
    },
  });
  await recordAdminLog({ actorId: session.user.id, action: "course.update", targetType: "Course", targetId: id });
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}/edit`);
  return {};
}

export async function deleteCourse(id: string) {
  const session = await requireAdminSession();
  const lessons = await prisma.courseLesson.findMany({ where: { courseId: id }, select: { filePath: true } });
  await prisma.course.delete({ where: { id } });
  for (const l of lessons) {
    if (l.filePath) await del(l.filePath).catch(() => {});
  }
  await recordAdminLog({ actorId: session.user.id, action: "course.delete", targetType: "Course", targetId: id });
  revalidatePath("/admin/courses");
}

// ---------------- レッスン ----------------

export type LessonFormState = { error?: string };

export async function createLesson(courseId: string, formData: FormData): Promise<LessonFormState> {
  const session = await requireAdminSession();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "レッスンタイトルを入力してください" };

  const videoSourceType = String(formData.get("videoSourceType") ?? "youtube");
  const youtubeUrl = String(formData.get("youtubeUrl") ?? "").trim();
  const filePath = String(formData.get("filePath") ?? "").trim();
  const fileMimeType = String(formData.get("fileMimeType") ?? "").trim();

  let youtubeId: string | null = null;
  if (videoSourceType === "youtube" && youtubeUrl) {
    youtubeId = extractYoutubeId(youtubeUrl);
    if (!youtubeId) return { error: "YouTube URLから動画IDを取得できませんでした" };
  }

  const last = await prisma.courseLesson.findFirst({ where: { courseId }, orderBy: { sortOrder: "desc" } });

  await prisma.courseLesson.create({
    data: {
      courseId,
      title,
      videoSourceType,
      videoUrl: videoSourceType === "youtube" ? youtubeUrl || null : null,
      youtubeId,
      filePath: videoSourceType === "upload" ? filePath || null : null,
      fileMimeType: videoSourceType === "upload" ? fileMimeType || null : null,
      pdfUrl: String(formData.get("pdfUrl") ?? "").trim() || null,
      bodyHtml: String(formData.get("bodyHtml") ?? "").trim() || null,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });
  await recordAdminLog({ actorId: session.user.id, action: "lesson.create", targetType: "Course", targetId: courseId });
  revalidatePath(`/admin/courses/${courseId}/edit`);
  return {};
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const session = await requireAdminSession();
  const lesson = await prisma.courseLesson.findUnique({ where: { id: lessonId } });
  await prisma.courseLesson.delete({ where: { id: lessonId } });
  if (lesson?.filePath) await del(lesson.filePath).catch(() => {});
  await recordAdminLog({ actorId: session.user.id, action: "lesson.delete", targetType: "Course", targetId: courseId });
  revalidatePath(`/admin/courses/${courseId}/edit`);
}
