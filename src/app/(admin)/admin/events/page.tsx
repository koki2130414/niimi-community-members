import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { deleteEvent } from "@/lib/actions/admin-event-actions";
import { EVENT_STATUS_LABELS } from "@/lib/content-status";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { EventCreateForm } from "@/components/admin/EventCreateForm";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  await requireAdminSession();
  const events = await prisma.event.findMany({
    where: { deletedAt: null },
    orderBy: { startsAt: "asc" },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-brand-green-dark">イベント管理</h1>
        <div className="space-y-2">
          {events.map((e) => (
            <Card key={e.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <div>
                  <Badge tone={e.status === "OPEN" ? "gold" : "neutral"}>{EVENT_STATUS_LABELS[e.status]}</Badge>
                  <p className="mt-1 text-sm font-bold text-brand-green-dark">{e.title}</p>
                  <p className="text-xs text-brand-green-light">{formatDateTime(e.startsAt)}</p>
                </div>
                <DeleteButton id={e.id} />
              </CardBody>
            </Card>
          ))}
          {events.length === 0 && <p className="text-sm text-brand-green-light">イベントはまだ登録されていません</p>}
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-base font-bold text-brand-green-dark">新規イベント登録</h2>
        <Card>
          <CardBody>
            <EventCreateForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  async function action() {
    "use server";
    await deleteEvent(id);
  }
  return (
    <form action={action}>
      <ConfirmSubmitButton confirmMessage="このイベントを削除します。よろしいですか？">削除</ConfirmSubmitButton>
    </form>
  );
}
