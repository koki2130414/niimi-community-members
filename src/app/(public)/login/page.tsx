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
      </div>
    </div>
  );
}
