import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { markLessonComplete } from "@/lib/actions/ippos-actions";
import { QuizBlock } from "@/components/member/QuizBlock";
import { SecureVideoPlayer } from "@/components/member/SecureVideoPlayer";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({ params }: { params: { domain: string; courseId: string } }) {
  if (params.domain !== "ai") notFound();

  const session = await requireMemberSession();

  const [course, lessons, quizzes, progress] = await Promise.all([
    prisma.course.findUnique({ where: { id: params.courseId } }),
    prisma.courseLesson.findMany({ where: { courseId: params.courseId }, orderBy: { sortOrder: "asc" } }),
    prisma.courseQuiz.findMany({ where: { courseId: params.courseId }, orderBy: { sortOrder: "asc" } }),
    prisma.courseProgress.findUnique({ where: { userId_courseId: { userId: session.user.id, courseId: params.courseId } } }),
  ]);
  if (!course) notFound();

  const completedIds = new Set((progress?.completedLessonIds ?? "").split(",").filter(Boolean));
  const totalLessons = lessons.length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-green-dark">{course.title}</h1>
          <p className="mt-1 text-sm text-brand-green-light">{course.description}</p>
          <div className="mt-2">
            <Badge tone="gold">修了で +{course.pointsOnComplete}pt</Badge>
          </div>
        </div>
        <span className="shrink-0 text-2xl font-bold text-brand-green">{progress?.progressPercent ?? 0}%</span>
      </div>

      {progress?.completedAt && (
        <Card className="border-brand-gold bg-brand-gold-light/30">
          <CardBody className="text-center">
            <p className="text-sm font-bold text-brand-green-dark">🎓 修了証を獲得しました！</p>
            <p className="text-xs text-brand-green-light">おめでとうございます。この講座を修了しました。</p>
          </CardBody>
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="text-base font-bold text-brand-green-dark">レッスン</h2>
        {lessons.map((lesson, i) => {
          const done = completedIds.has(lesson.id);
          const completeAction = async () => {
            "use server";
            await markLessonComplete(course!.id, lesson.id, totalLessons);
          };
          return (
            <Card key={lesson.id} className={done ? "border-brand-gold" : undefined}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-brand-green-light">レッスン {i + 1}</p>
                    <p className="text-sm font-bold text-brand-green-dark">{lesson.title}</p>
                    {lesson.videoSourceType === "youtube" && lesson.youtubeId && (
                      <div className="mt-3 aspect-video overflow-hidden rounded-card bg-black">
                        <iframe
                          className="h-full w-full"
                          src={`https://www.youtube.com/embed/${lesson.youtubeId}`}
                          title={lesson.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                    {lesson.videoSourceType === "upload" && lesson.filePath && (
                      <div className="mt-3 aspect-video overflow-hidden rounded-card bg-black">
                        <SecureVideoPlayer src={`/api/courses/lessons/${lesson.id}/stream`} />
                      </div>
                    )}
                    {lesson.bodyHtml && <div className="prose mt-3 text-sm text-brand-green-dark" dangerouslySetInnerHTML={{ __html: lesson.bodyHtml }} />}
                    {lesson.pdfUrl && (
                      <a href={lesson.pdfUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-brand-green underline">
                        📄 PDF資料を開く
                      </a>
                    )}
                  </div>
                  <form action={completeAction}>
                    <button
                      type="submit"
                      className={`rounded-full px-4 py-2 text-xs font-semibold ${
                        done ? "bg-brand-gold-light text-brand-green-dark" : "bg-brand-cream text-brand-green-light hover:bg-brand-green hover:text-white"
                      }`}
                    >
                      {done ? "完了済み ✓" : "完了にする"}
                    </button>
                  </form>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </section>

      {quizzes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-brand-green-dark">理解度クイズ</h2>
          {quizzes.map((q) => (
            <QuizBlock key={q.id} question={q.question} choices={JSON.parse(q.choicesJson)} correctIndex={q.correctIndex} />
          ))}
        </section>
      )}
    </div>
  );
}
