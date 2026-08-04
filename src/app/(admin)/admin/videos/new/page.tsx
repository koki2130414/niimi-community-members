import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { createVideo } from "@/lib/actions/admin-video-actions";
import { VideoForm } from "@/components/admin/VideoForm";
import { Card, CardBody } from "@/components/ui/Card";

export default async function AdminVideoNewPage() {
  await requireAdminSession();
  const categories = await prisma.videoCategory.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-xl font-bold text-brand-green-dark">動画新規登録</h1>
      <Card>
        <CardBody>
          <VideoForm action={createVideo} categories={categories} submitLabel="登録する" />
        </CardBody>
      </Card>
    </div>
  );
}
