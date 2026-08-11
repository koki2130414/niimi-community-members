"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";

export type CheckInFormState = { error?: string; success?: boolean };

/** 会員がブログ記事を投稿する。承認制のため、投稿直後は非公開（管理者の承認待ち）となる。 */
export async function submitMemberBlogPost(
  _prev: CheckInFormState | undefined,
  formData: FormData
): Promise<CheckInFormState> {
  const session = await requireMemberSession();
  const title = String(formData.get("title") ?? "").trim();
  const bodyHtml = String(formData.get("bodyHtml") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();

  if (!title || !bodyHtml) {
    return { error: "タイトルと本文は必須です" };
  }

  await prisma.article.create({
    data: {
      title,
      bodyHtml: `<p>${bodyHtml.replace(/\n/g, "</p><p>")}</p>`,
      summary: summary || undefined,
      authorId: session.user.id,
      authorName: session.user.displayName,
      isPublished: false,
    },
  });

  revalidatePath("/member/checkin");
  return { success: true };
}

/** 気軽な情報シェア投稿を作成する。即時公開。 */
export async function createCheckInPost(formData: FormData) {
  const session = await requireMemberSession();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await prisma.checkInPost.create({ data: { authorId: session.user.id, body } });
  revalidatePath("/member/checkin");
}

export async function toggleCheckInLike(postId: string) {
  const session = await requireMemberSession();
  const existing = await prisma.checkInPostLike.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } },
  });
  if (existing) {
    await prisma.checkInPostLike.delete({ where: { postId_userId: { postId, userId: session.user.id } } });
  } else {
    await prisma.checkInPostLike.create({ data: { postId, userId: session.user.id } });
  }
  revalidatePath("/member/checkin");
}

export async function deleteCheckInPost(postId: string) {
  const session = await requireMemberSession();
  const post = await prisma.checkInPost.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== session.user.id) return;
  await prisma.checkInPost.delete({ where: { id: postId } });
  revalidatePath("/member/checkin");
}
