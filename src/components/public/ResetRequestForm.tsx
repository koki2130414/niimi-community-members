"use client";

import { useFormState, useFormStatus } from "react-dom";
import { requestPasswordReset, type ResetRequestState } from "@/lib/actions/reset-password-actions";
import { Label, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const initialState: ResetRequestState = {};

export function ResetRequestForm() {
  const [state, formAction] = useFormState(requestPasswordReset, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="loginIdOrEmail">ログインID または メールアドレス</Label>
        <Input id="loginIdOrEmail" name="loginIdOrEmail" required />
      </div>
      <SubmitButton />
      {state.message && <p className="text-sm text-brand-green-dark">{state.message}</p>}
      {state.devResetUrl && (
        <p className="rounded-card border border-brand-gold bg-brand-gold-light p-3 text-xs text-brand-green-dark">
          【開発環境用】再設定リンク:{" "}
          <a href={state.devResetUrl} className="underline">
            {state.devResetUrl}
          </a>
        </p>
      )}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "送信中..." : "再設定用リンクを送る"}
    </Button>
  );
}
