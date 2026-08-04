import Link from "next/link";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { deleteVideo } from "@/lib/actions/admin-video-actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminVideoListPage() {
  await requireAdminSession();
  const videos = await prisma.video.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-green-dark">動画管理</h1>
        <Link href="/admin/videos/new">
          <Button>+ 新規動画登録</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-card border border-brand-beige bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-beige bg-brand-cream text-xs text-brand-green-light">
            <tr>
              <th className="p-3">タイトル</th>
              <th className="p-3">カテゴリー</th>
              <th className="p-3">状態</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id} className="border-b border-brand-beige last:border-0">
                <td className="p-3 font-medium text-brand-green-dark">{v.title}</td>
                <td className="p-3 text-xs">{v.category?.name ?? "-"}</td>
                <td className="p-3">
                  <Badge tone={v.isPublished ? "green" : "neutral"}>{v.isPublished ? "公開中" : "非公開"}</Badge>
                  {v.isFeatured && <Badge tone="gold">おすすめ</Badge>}
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/videos/${v.id}/edit`} className="mr-3 text-xs font-semibold text-brand-green hover:text-brand-gold">
                    編集
                  </Link>
                  <DeleteButton id={v.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {videos.length === 0 && <p className="p-6 text-center text-sm text-brand-green-light">まだ動画が登録されていません</p>}
      </div>
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  async function action() {
    "use server";
    await deleteVideo(id);
  }
  return (
    <form action={action} className="inline">
      <ConfirmSubmitButton confirmMessage="この動画を削除します。よろしいですか？">削除</ConfirmSubmitButton>
    </form>
  );
}
