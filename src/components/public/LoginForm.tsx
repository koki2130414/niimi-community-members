"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Label, Input, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "ログインIDまたはパスワードが正しくありません",
  LOCKED: "ログイン試行回数の上限に達しました。しばらく時間をおいてから再度お試しください",
  INACTIVE: "このアカウントは現在ご利用いただけません。運営事務局にお問い合わせください",
  inactive: "セッションが無効になったため、再度ログインしてください",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reasonFromUrl = searchParams.get("reason");
  const [error, setError] = useState<string | null>(
    reasonFromUrl ? ERROR_MESSAGES[reasonFromUrl] ?? null : null
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        loginIdOrEmail: formData.get("loginIdOrEmail"),
        password: formData.get("password"),
        redirect: false,
      });

      if (result?.error) {
        setError(ERROR_MESSAGES[result.error] ?? "ログインに失敗しました");
        return;
      }
      router.push("/");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="loginIdOrEmail">ログインID または メールアドレス</Label>
        <Input id="loginIdOrEmail" name="loginIdOrEmail" autoComplete="username" required />
      </div>
      <div>
        <Label htmlFor="password">パスワード</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <FieldError message={error ?? undefined} />
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "ログイン中..." : "ログイン"}
      </Button>
      <a href="/reset-password" className="block text-center text-xs text-brand-green-light hover:text-brand-green">
        パスワードをお忘れの方はこちら
      </a>
    </form>
  );
}
