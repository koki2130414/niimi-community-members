import { requireMemberSession } from "@/lib/auth-helpers";
import { PasswordChangeForm } from "@/components/member/PasswordChangeForm";
import { Card, CardBody } from "@/components/ui/Card";

export default async function PasswordChangePage() {
  await requireMemberSession();

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-brand-green-dark">パスワード変更</h1>
      <Card>
        <CardBody>
          <PasswordChangeForm />
        </CardBody>
      </Card>
    </div>
  );
}
