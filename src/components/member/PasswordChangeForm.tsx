"use client";

import { useFormState, useFormStatus } from "react-dom";
import { changeMyPassword, type PasswordChangeState } from "@/lib/actions/password-actions";
import { Label, Input, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const initialState: PasswordChangeState = {};

export function PasswordChangeForm() {
  const [state, formAction] = useFormState(changeMyPassword, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="currentPassword">現在のパスワード</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>
      <div>
        <Label htmlFor="newPassword">新しいパスワード（8文字以上・英数字を含む）</Label>
        <Input id="newPassword" name="newPassword" type="password" required />
      </div>
      <div>
        <Label htmlFor="newPasswordConfirm">新しいパスワード（確認）</Label>
        <Input id="newPasswordConfirm" name="newPasswordConfirm" type="password" required />
      </div>
      <FieldError message={state.error} />
      {state.success && <p className="text-xs font-semibold text-brand-green">パスワードを変更しました</p>}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "変更中..." : "パスワードを変更する"}
    </Button>
  );
}
