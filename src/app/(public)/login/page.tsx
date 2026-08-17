import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSiteName } from "@/lib/site-settings";
import { LoginForm } from "@/components/public/LoginForm";
import { Card, CardBody } from "@/components/ui/Card";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.membershipPlan === "ADMIN" ? "/admin" : "/member");
  }
  const siteName = await getSiteName();

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-lg font-bold text-brand-green-dark">{siteName}</h1>
        <Card>
          <CardBody>
            <LoginForm />
          </CardBody>
        </Card>
        <p className="mt-4 text-center text-xs text-brand-green-light">
          ログイン情報は運営事務局より発行されます。共通IDの使い回しはできません。
        </p>

        <Card className="mt-4">
          <CardBody className="text-center">
            <p className="text-sm font-semibold text-brand-green-dark">まだ会員登録がお済みでない方へ</p>
            <p className="mt-1 text-xs text-brand-green-light">
              下記フォームよりお申し込みください。運営事務局にてログイン情報を発行いたします。
            </p>
            <a
              href="https://forms.gle/g1vD3JPqSUJRNavG8"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block rounded-full bg-brand-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark"
            >
              新規登録フォームへ →
            </a>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
