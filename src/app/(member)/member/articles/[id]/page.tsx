import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { requireMemberSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { canViewContent } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import { markArticleViewed, toggleArticleFavorite } from "@/lib/actions/article-actions";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({ params }: { params: { id: string } }) {
  const session = await requireMemberSession();
  const plan = session.user.membershipPlan;

  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!article || article.deletedAt || !article.isPublished || !canViewContent(plan, article.allowedPlans)) {
    notFound();
  }

  await markArticleViewed(article.id);

  const favorite = await prisma.articleFavorite.findUnique({
    where: { userId_articleId: { userId: session.user.id, articleId: article.id } },
  });

  // 保存時にもサニタイズ済みだが、表示直前にも再度サニタイズし多層防御する（XSS対策）
  const safeHtml = DOMPurify.sanitize(article.bodyHtml, {
    ALLOWED_TAGS: [
      "p", "h2", "h3", "strong", "em", "ul", "ol", "li", "a", "img",
      "blockquote", "hr", "iframe", "br", "span",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "target", "rel", "class", "allow", "allowfullscreen", "frameborder"],
  });

  const articleId = article.id;
  async function toggleFavoriteAction() {
    "use server";
    await toggleArticleFavorite(articleId);
  }

  return (
    <article className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {article.category && <Badge tone="neutral">{article.category.name}</Badge>}
        {article.isFeatured && <Badge tone="gold">おすすめ</Badge>}
        {article.publishedAt && <span className="text-xs text-brand-green-light">{formatDate(article.publishedAt)}</span>}
      </div>

      <h1 className="text-xl font-bold text-brand-green-dark">{article.title}</h1>
      {article.authorName && <p className="text-xs text-brand-green-light">執筆者: {article.authorName}</p>}

      {article.eyecatchUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.eyecatchUrl} alt={article.title} className="w-full rounded-card object-cover" />
      )}

      <div className="prose-article" dangerouslySetInnerHTML={{ __html: safeHtml }} />

      {article.externalUrl && (
        <a
          href={article.externalUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-card border border-brand-beige bg-white px-4 py-2.5 text-sm font-semibold text-brand-green-dark hover:border-brand-gold"
        >
          📖 note.comで元記事を読む →
        </a>
      )}

      <form action={toggleFavoriteAction}>
        <button
          type="submit"
          className={`rounded-card border px-4 py-2 text-sm font-semibold ${
            favorite ? "border-brand-gold bg-brand-gold-light text-brand-green-dark" : "border-brand-beige bg-white text-brand-green-dark"
          }`}
        >
          {favorite ? "★ お気に入り登録済み" : "☆ お気に入りに登録"}
        </button>
      </form>
    </article>
  );
}
