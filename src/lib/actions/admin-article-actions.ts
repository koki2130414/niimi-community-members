"use server";

import DOMPurify from "isomorphic-dompurify";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-helpers";
import { articleUpsertSchema } from "@/lib/validators";
import { serializeAllowedPlans, type MembershipPlan } from "@/lib/permissions";
import { recordAdminLog } from "@/lib/admin-log";

export type ArticleFormState = { error?: string };

const ARTICLE_ALLOWED_TAGS = [
  "p", "h2", "h3", "strong", "em", "ul", "ol", "li", "a", "img",
  "blockquote", "hr", "iframe", "br", "span",
];
const ARTICLE_ALLOWED_ATTR = ["href", "src", "alt", "target", "rel", "class", "allow", "allowfullscreen", "frameborder"];

function parseAllowedPlansFromForm(formData: FormData): MembershipPlan[] {
  return formData.getAll("allowedPlans") as MembershipPlan[];
}

export async function createArticle(_prev: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  const session = await requireAdminSession();

  const parsed = articleUpsertSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary") || undefined,
    bodyHtml: formData.get("bodyHtml"),
    categoryId: formData.get("categoryId") || null,
    tags: formData.get("tags") || undefined,
    authorName: formData.get("authorName") || undefined,
    isPublished: formData.get("isPublished") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    allowedPlans: parseAllowedPlansFromForm(formData),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };
  }

  // 保存前にサニタイズし、蓄積型XSSを防止する
  const safeBodyHtml = DOMPurify.sanitize(parsed.data.bodyHtml, {
    ALLOWED_TAGS: ARTICLE_ALLOWED_TAGS,
    ALLOWED_ATTR: ARTICLE_ALLOWED_ATTR,
  });

  const article = await prisma.article.create({
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary,
      bodyHtml: safeBodyHtml,
      categoryId: parsed.data.categoryId || null,
      tags: parsed.data.tags,
      authorName: parsed.data.authorName,
      isPublished: parsed.data.isPublished,
      isFeatured: parsed.data.isFeatured,
      allowedPlans: serializeAllowedPlans(parsed.data.allowedPlans),
      publishedAt: parsed.data.isPublished ? new Date() : null,
    },
  });

  if (parsed.data.isPublished) {
    await recordAdminLog({ actorId: session.user.id, action: "article.publish", targetType: "Article", targetId: article.id });
  }

  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function updateArticle(id: string, _prev: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  const session = await requireAdminSession();

  const parsed = articleUpsertSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary") || undefined,
    bodyHtml: formData.get("bodyHtml"),
    categoryId: formData.get("categoryId") || null,
    tags: formData.get("tags") || undefined,
    authorName: formData.get("authorName") || undefined,
    isPublished: formData.get("isPublished") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    allowedPlans: parseAllowedPlansFromForm(formData),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };
  }

  const safeBodyHtml = DOMPurify.sanitize(parsed.data.bodyHtml, {
    ALLOWED_TAGS: ARTICLE_ALLOWED_TAGS,
    ALLOWED_ATTR: ARTICLE_ALLOWED_ATTR,
  });

  const existing = await prisma.article.findUnique({ where: { id } });
  const nowPublishing = parsed.data.isPublished && existing && !existing.isPublished;

  await prisma.article.update({
    where: { id },
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary,
      bodyHtml: safeBodyHtml,
      categoryId: parsed.data.categoryId || null,
      tags: parsed.data.tags,
      authorName: parsed.data.authorName,
      isPublished: parsed.data.isPublished,
      isFeatured: parsed.data.isFeatured,
      allowedPlans: serializeAllowedPlans(parsed.data.allowedPlans),
      publishedAt: parsed.data.isPublished ? existing?.publishedAt ?? new Date() : existing?.publishedAt,
    },
  });

  if (nowPublishing) {
    await recordAdminLog({ actorId: session.user.id, action: "article.publish", targetType: "Article", targetId: id });
  } else {
    await recordAdminLog({ actorId: session.user.id, action: "article.update", targetType: "Article", targetId: id });
  }

  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}/edit`);
  return {};
}

export async function deleteArticle(id: string) {
  const session = await requireAdminSession();
  await prisma.article.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });
  await recordAdminLog({ actorId: session.user.id, action: "article.delete", targetType: "Article", targetId: id });
  revalidatePath("/admin/articles");
}
