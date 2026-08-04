import { requireAdminSession } from "@/lib/auth-helpers";
import { MemberCreateForm } from "@/components/admin/MemberCreateForm";
import { Card, CardBody } from "@/components/ui/Card";

export default async function AdminMemberNewPage() {
  await requireAdminSession();
  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-xl font-bold text-brand-green-dark">会員新規登録</h1>
      <Card>
        <CardBody>
          <MemberCreateForm />
        </CardBody>
      </Card>
    </div>
  );
}
