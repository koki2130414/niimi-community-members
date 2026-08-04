"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { canViewContent } from "@/lib/permissions";

export async function markArticleViewed(articleId: string) {
  const session = await requireMemberSession();
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article || article.deletedAt || !article.isPublished) return;
  if (!canViewContent(session.user.membershipPlan, article.allowedPlans)) return;

  await prisma.articleView.upsert({
    where: { userId_articleId: { userId: session.user.id, articleId } },
    update: { viewedAt: new Date() },
    create: { userId: session.user.id, articleId },
  });
}

export async function toggleArticleFavorite(articleId: string) {
  const session = await requireMemberSession();
  const existing = await prisma.articleFavorite.findUnique({
    where: { userId_articleId: { userId: session.user.id, articleId } },
  });

  if (existing) {
    await prisma.articleFavorite.delete({ where: { id: existing.id } });
  } else {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article || article.deletedAt || !article.isPublished) return;
    if (!canViewContent(session.user.membershipPlan, article.allowedPlans)) return;
    await prisma.articleFavorite.create({ data: { userId: session.user.id, articleId } });
  }

  revalidatePath(`/member/articles/${articleId}`);
  revalidatePath("/member/mypage");
}
