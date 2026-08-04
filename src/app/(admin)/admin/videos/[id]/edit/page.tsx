import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { updateVideo } from "@/lib/actions/admin-video-actions";
import { parseAllowedPlans } from "@/lib/permissions";
import { VideoForm } from "@/components/admin/VideoForm";
import { Card, CardBody } from "@/components/ui/Card";

export default async function AdminVideoEditPage({ params }: { params: { id: string } }) {
  await requireAdminSession();
  const [video, categories] = await Promise.all([
    prisma.video.findUnique({ where: { id: params.id } }),
    prisma.videoCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!video || video.deletedAt) notFound();

  const boundUpdateVideo = updateVideo.bind(null, video.id);

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-xl font-bold text-brand-green-dark">動画編集</h1>
      <Card>
        <CardBody>
          <VideoForm
            action={boundUpdateVideo}
            categories={categories}
            submitLabel="更新する"
            defaultValues={{
              title: video.title,
              youtubeUrl: video.youtubeUrl,
              description: video.description ?? "",
              categoryId: video.categoryId ?? "",
              tags: video.tags ?? "",
              isPublished: video.isPublished,
              isFeatured: video.isFeatured,
              allowedPlans: parseAllowedPlans(video.allowedPlans),
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
