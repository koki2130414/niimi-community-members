"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateMyProfile, type ProfileUpdateState } from "@/lib/actions/profile-actions";
import { Label, Input, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const initialState: ProfileUpdateState = {};

export function ProfileEditForm({
  defaultName,
  defaultDisplayName,
  defaultEmail,
}: {
  defaultName: string;
  defaultDisplayName: string;
  defaultEmail: string;
}) {
  const [state, formAction] = useFormState(updateMyProfile, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">氏名</Label>
        <Input id="name" name="name" defaultValue={defaultName} required />
      </div>
      <div>
        <Label htmlFor="displayName">表示名</Label>
        <Input id="displayName" name="displayName" defaultValue={defaultDisplayName} required />
      </div>
      <div>
        <Label htmlFor="email">メールアドレス</Label>
        <Input id="email" name="email" type="email" defaultValue={defaultEmail} required />
      </div>
      <FieldError message={state.error} />
      {state.success && <p className="text-xs font-semibold text-brand-green">保存しました</p>}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "保存中..." : "保存する"}
    </Button>
  );
}
