import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { updateCourse, createLesson, deleteLesson } from "@/lib/actions/admin-course-actions";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Label, Input, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { LessonForm } from "@/components/admin/LessonForm";

export const dynamic = "force-dynamic";

const DOMAIN_LABEL: Record<string, string> = { ai: "AI講座", business: "ビジネス講座", psychology: "心理学", agriculture: "農業" };

export default async function AdminCourseEditPage({ params }: { params: { id: string } }) {
  await requireAdminSession();
  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course) notFound();

  const lessons = await prisma.courseLesson.findMany({ where: { courseId: course.id }, orderBy: { sortOrder: "asc" } });

  const updateAction = async (formData: FormData) => {
    "use server";
    return updateCourse(course!.id, formData);
  };
  const addLessonAction = async (formData: FormData) => {
    "use server";
    return createLesson(course!.id, formData);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Badge tone="neutral">{DOMAIN_LABEL[course.domain] ?? course.domain}</Badge>
        <h1 className="mt-1 text-xl font-bold text-brand-green-dark">{course.title} を編集</h1>
      </div>

      <Card>
        <CardBody>
          <form action={updateAction} className="space-y-4">
            <div>
              <Label htmlFor="title">講座タイトル</Label>
              <Input id="title" name="title" defaultValue={course.title} required />
            </div>
            <div>
              <Label htmlFor="description">説明</Label>
              <Textarea id="description" name="description" rows={3} defaultValue={course.description ?? ""} />
            </div>
            <div>
              <Label htmlFor="pointsOnComplete">修了ポイント</Label>
              <Input id="pointsOnComplete" name="pointsOnComplete" type="number" defaultValue={course.pointsOnComplete} />
            </div>
            <label className="flex items-center gap-1.5 text-sm text-brand-green-dark">
              <input type="checkbox" name="isPublished" defaultChecked={course.isPublished} />
              公開する
            </label>
            <Button type="submit">保存する</Button>
          </form>
        </CardBody>
      </Card>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-brand-green-dark">レッスン一覧（{lessons.length}件）</h2>
        {lessons.map((lesson, i) => {
          const deleteAction = async () => {
            "use server";
            await deleteLesson(lesson.id, course!.id);
          };
          return (
            <Card key={lesson.id}>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-brand-green-light">レッスン{i + 1}</p>
                  <p className="text-sm font-bold text-brand-green-dark">{lesson.title}</p>
                  <Badge tone="neutral">
                    {lesson.videoSourceType === "youtube" ? "YouTube" : lesson.videoSourceType === "upload" ? "アップロード動画" : "テキストのみ"}
                  </Badge>
                </div>
                <form action={deleteAction}>
                  <ConfirmSubmitButton confirmMessage="このレッスンを削除します。よろしいですか？">削除</ConfirmSubmitButton>
                </form>
              </CardBody>
            </Card>
          );
        })}

        <LessonForm action={addLessonAction} />
      </section>
    </div>
  );
}
