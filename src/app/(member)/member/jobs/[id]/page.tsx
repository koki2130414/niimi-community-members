import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { applyToJob } from "@/lib/actions/ippos-actions";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = { intern: "インターン", "part-time": "アルバイト", contract: "業務委託", "full-time": "正社員" };

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const session = await requireMemberSession();

  const job = await prisma.jobPost.findUnique({ where: { id: params.id } });
  if (!job) notFound();

  const myApplication = await prisma.jobApplication.findFirst({
    where: { jobId: job.id, applicantId: session.user.id },
  });

  const applyAction = async (formData: FormData) => {
    "use server";
    await applyToJob(job!.id, formData);
  };

  return (
    <div className="space-y-5">
      <div>
        <Badge tone="neutral">{TYPE_LABEL[job.employmentType] ?? job.employmentType}</Badge>
        <h1 className="mt-3 text-xl font-bold text-brand-green-dark">{job.title}</h1>
        <p className="mt-1 text-sm text-brand-green-light">
          {job.companyName}
          {job.location ? ` ・ ${job.location}` : ""}
        </p>
      </div>

      <Card>
        <CardBody>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-green-dark">{job.description}</p>
        </CardBody>
      </Card>

      {myApplication ? (
        <Card className="border-brand-gold bg-brand-gold-light/30">
          <CardBody>
            <p className="text-sm font-semibold text-brand-green-dark">応募済みです（ステータス: {myApplication.status}）</p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <form action={applyAction} className="space-y-3">
              <label className="mb-1 block text-xs font-semibold text-brand-green-dark">応募メッセージ</label>
              <textarea name="message" rows={4} className="w-full rounded-lg border border-brand-beige px-3.5 py-2.5 text-sm outline-none focus:border-brand-green" />
              <button type="submit" className="rounded-full bg-brand-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark">
                応募する
              </button>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
