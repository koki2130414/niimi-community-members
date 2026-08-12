"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { awardPoints } from "@/lib/points";

export type CheckInFormState = { error?: string; success?: boolean };

/** 会員がブログ記事を投稿する。チェックインからの投稿は即時公開される。 */
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

  const article = await prisma.article.create({
    data: {
      title,
      bodyHtml: `<p>${bodyHtml.replace(/\n/g, "</p><p>")}</p>`,
      summary: summary || undefined,
      authorId: session.user.id,
      authorName: session.user.displayName,
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await awardPoints(session.user.id, "blog_post", { table: "Article", id: article.id });

  revalidatePath("/member/checkin");
  revalidatePath("/member/articles");
  revalidatePath("/member");

  // Slackの「メンバーブログ」チャンネルへ通知する（Webhook未設定の場合は何もしない）
  const webhookUrl = process.env.SLACK_MEMBER_BLOG_WEBHOOK_URL;
  if (webhookUrl) {
    const preview = summary || bodyHtml.slice(0, 100);
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `📚 *${session.user.displayName}* さんがブログを投稿しました\n*${title}*\n${preview}`,
      }),
    }).catch(() => {});
  }

  return { success: true };
}

/** 気軽な情報シェア投稿を作成する。即時公開。 */
export async function createCheckInPost(formData: FormData) {
  const session = await requireMemberSession();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await prisma.checkInPost.create({ data: { authorId: session.user.id, body } });
  revalidatePath("/member/checkin");

  // Slackへも通知する（Webhook未設定の場合は何もしない。失敗してもチェックイン自体は成功させる）
  const webhookUrl = process.env.SLACK_CHECKIN_WEBHOOK_URL;
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `📝 *${session.user.displayName}* さんがチェックインしました\n${body}`,
      }),
    }).catch(() => {});
  }
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
