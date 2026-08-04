import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { deleteAnnouncement } from "@/lib/actions/admin-announcement-actions";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { AnnouncementCreateForm } from "@/components/admin/AnnouncementCreateForm";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  await requireAdminSession();
  const announcements = await prisma.announcement.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-brand-green-dark">お知らせ管理</h1>
        <div className="space-y-2">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    {a.importance === "IMPORTANT" && <Badge tone="gold">重要</Badge>}
                    <Badge tone={a.isPublished ? "green" : "neutral"}>{a.isPublished ? "公開中" : "非公開"}</Badge>
                  </div>
                  <p className="text-sm font-bold text-brand-green-dark">{a.title}</p>
                  {a.publishedAt && <p className="text-xs text-brand-green-light">{formatDate(a.publishedAt)}</p>}
                </div>
                <DeleteButton id={a.id} />
              </CardBody>
            </Card>
          ))}
          {announcements.length === 0 && <p className="text-sm text-brand-green-light">お知らせはまだありません</p>}
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-base font-bold text-brand-green-dark">新規お知らせ投稿</h2>
        <Card>
          <CardBody>
            <AnnouncementCreateForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  async function action() {
    "use server";
    await deleteAnnouncement(id);
  }
  return (
    <form action={action}>
      <ConfirmSubmitButton confirmMessage="このお知らせを削除します。よろしいですか？">削除</ConfirmSubmitButton>
    </form>
  );
}
