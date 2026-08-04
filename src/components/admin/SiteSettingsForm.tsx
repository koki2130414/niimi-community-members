"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateSiteSettings, type SiteSettingsFormState } from "@/lib/actions/admin-site-settings-actions";
import { Label, Input, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const initialState: SiteSettingsFormState = {};

export function SiteSettingsForm({ defaultSiteName }: { defaultSiteName: string }) {
  const [state, formAction] = useFormState(updateSiteSettings, initialState);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="siteName">サービス名</Label>
        <Input id="siteName" name="siteName" defaultValue={defaultSiteName} required />
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
