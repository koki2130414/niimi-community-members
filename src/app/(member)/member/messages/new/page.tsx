import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { Card, CardBody } from "@/components/ui/Card";
import { findOrCreateDmThread } from "@/lib/actions/ippos-actions";

export const dynamic = "force-dynamic";

export default async function NewMessagePage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await requireMemberSession();

  const members = await prisma.user.findMany({
    where: {
      id: { not: session.user.id },
      deletedAt: null,
      status: "ACTIVE",
      ...(searchParams.q ? { displayName: { contains: searchParams.q } } : {}),
    },
    select: { id: true, displayName: true },
    orderBy: { displayName: "asc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-brand-green-dark">新しいメッセージ</h1>

      <form className="flex">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="会員名で検索"
          className="w-full max-w-sm rounded-full border border-brand-beige px-4 py-2 text-sm outline-none focus:border-brand-green"
        />
      </form>

      {members.length === 0 ? (
        <p className="rounded-card border border-dashed border-brand-beige bg-white py-10 text-center text-sm text-brand-green-light">
          該当する会員が見つかりませんでした
        </p>
      ) : (
        <div className="space-y-2">
          {members.map((m) => {
            const startAction = async () => {
              "use server";
              const threadId = await findOrCreateDmThread(m.id);
              redirect(`/member/messages/${threadId}`);
            };
            return (
              <form key={m.id} action={startAction}>
                <button type="submit" className="w-full text-left">
                  <Card className="transition hover:border-brand-gold">
                    <CardBody>
                      <p className="text-sm font-bold text-brand-green-dark">{m.displayName}</p>
                    </CardBody>
                  </Card>
                </button>
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}
