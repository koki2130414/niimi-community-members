import Link from "next/link";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { createVideoCategory, renameVideoCategory, deleteVideoCategory } from "@/lib/actions/admin-video-actions";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminVideoCategoriesPage() {
  await requireAdminSession();

  const categories = await prisma.videoCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { videos: true } } },
  });

  return (
    <div className="max-w-lg space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-green-dark">動画カテゴリー管理</h1>
        <Link href="/admin/videos" className="text-xs font-semibold text-brand-green hover:text-brand-gold">
          ← 動画管理に戻る
        </Link>
      </div>

      <Card>
        <CardBody>
          <form action={createVideoCategory} className="flex gap-2">
            <input
              name="name"
              required
              placeholder="新しいカテゴリー名（例：稲作の基本）"
              className="flex-1 rounded-lg border border-brand-beige px-3.5 py-2.5 text-sm outline-none focus:border-brand-green"
            />
            <Button type="submit">追加する</Button>
          </form>
        </CardBody>
      </Card>

      {categories.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          カテゴリーはまだありません
        </p>
      ) : (
        <div className="space-y-2">
          {categories.map((c) => {
            const renameAction = async (formData: FormData) => {
              "use server";
              await renameVideoCategory(c.id, formData);
            };
            const deleteAction = async () => {
              "use server";
              await deleteVideoCategory(c.id);
            };
            return (
              <Card key={c.id}>
                <CardBody className="flex items-center gap-3">
                  <form action={renameAction} className="flex flex-1 items-center gap-2">
                    <input
                      name="name"
                      defaultValue={c.name}
                      className="flex-1 rounded-lg border border-brand-beige px-3 py-1.5 text-sm outline-none focus:border-brand-green"
                    />
                    <button type="submit" className="text-xs font-semibold text-brand-green hover:text-brand-gold">
                      保存
                    </button>
                  </form>
                  <span className="shrink-0 text-xs text-brand-green-light">{c._count.videos}件の動画</span>
                  <form action={deleteAction}>
                    <ConfirmSubmitButton confirmMessage={`「${c.name}」を削除します。このカテゴリーの動画は「未分類」になります。よろしいですか？`}>
                      削除
                    </ConfirmSubmitButton>
                  </form>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
