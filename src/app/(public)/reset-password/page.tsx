import { ResetRequestForm } from "@/components/public/ResetRequestForm";
import { Card, CardBody } from "@/components/ui/Card";

export default function ResetPasswordRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-lg font-bold text-brand-green-dark">パスワード再設定</h1>
        <Card>
          <CardBody>
            <ResetRequestForm />
          </CardBody>
        </Card>
        <a href="/login" className="mt-4 block text-center text-xs text-brand-green-light hover:text-brand-green">
          ログインページに戻る
        </a>
      </div>
    </div>
  );
}
