import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { updateArticle } from "@/lib/actions/admin-article-actions";
import { parseAllowedPlans } from "@/lib/permissions";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { Card, CardBody } from "@/components/ui/Card";

export default async function AdminArticleEditPage({ params }: { params: { id: string } }) {
  await requireAdminSession();
  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { id: params.id } }),
    prisma.articleCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!article || article.deletedAt) notFound();

  const boundUpdateArticle = updateArticle.bind(null, article.id);

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-xl font-bold text-brand-green-dark">記事編集</h1>
      <Card>
        <CardBody>
          <ArticleForm
            action={boundUpdateArticle}
            categories={categories}
            submitLabel="更新する"
            defaultValues={{
              title: article.title,
              summary: article.summary ?? "",
              bodyHtml: article.bodyHtml,
              categoryId: article.categoryId ?? "",
              tags: article.tags ?? "",
              authorName: article.authorName ?? "",
              isPublished: article.isPublished,
              isFeatured: article.isFeatured,
              allowedPlans: parseAllowedPlans(article.allowedPlans),
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
