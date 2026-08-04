"use client";

import { useFormState, useFormStatus } from "react-dom";
import { confirmPasswordReset, type ResetConfirmState } from "@/lib/actions/reset-password-actions";
import { Label, Input, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const initialState: ResetConfirmState = {};

export function ResetConfirmForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(confirmPasswordReset, initialState);

  if (state.success) {
    return (
      <p className="text-sm text-brand-green-dark">
        パスワードを再設定しました。
        <a href="/login" className="ml-1 font-semibold underline">
          ログインページへ
        </a>
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="newPassword">新しいパスワード（8文字以上・英数字を含む）</Label>
        <Input id="newPassword" name="newPassword" type="password" required />
      </div>
      <div>
        <Label htmlFor="newPasswordConfirm">新しいパスワード（確認）</Label>
        <Input id="newPasswordConfirm" name="newPasswordConfirm" type="password" required />
      </div>
      <FieldError message={state.error} />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "更新中..." : "パスワードを更新する"}
    </Button>
  );
}
