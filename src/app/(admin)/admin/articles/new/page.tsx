import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { createArticle } from "@/lib/actions/admin-article-actions";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { Card, CardBody } from "@/components/ui/Card";

export default async function AdminArticleNewPage() {
  await requireAdminSession();
  const categories = await prisma.articleCategory.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-xl font-bold text-brand-green-dark">記事新規作成</h1>
      <Card>
        <CardBody>
          <ArticleForm action={createArticle} categories={categories} submitLabel="作成する" />
        </CardBody>
      </Card>
    </div>
  );
}
