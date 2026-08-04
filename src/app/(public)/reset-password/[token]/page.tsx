import { ResetConfirmForm } from "@/components/public/ResetConfirmForm";
import { Card, CardBody } from "@/components/ui/Card";

export default function ResetPasswordConfirmPage({ params }: { params: { token: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-lg font-bold text-brand-green-dark">新しいパスワードの設定</h1>
        <Card>
          <CardBody>
            <ResetConfirmForm token={params.token} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
