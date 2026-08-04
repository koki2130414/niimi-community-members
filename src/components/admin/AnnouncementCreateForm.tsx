"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createAnnouncement, type AnnouncementFormState } from "@/lib/actions/admin-announcement-actions";
import { Label, Input, Textarea, Select, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { AllowedPlansCheckboxGroup } from "@/components/admin/AllowedPlansCheckboxGroup";

const initialState: AnnouncementFormState = {};

export function AnnouncementCreateForm() {
  const [state, formAction] = useFormState(createAnnouncement, initialState);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="title">タイトル</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="bodyHtml">本文</Label>
        <Textarea id="bodyHtml" name="bodyHtml" rows={5} required />
      </div>
      <div>
        <Label htmlFor="importance">重要度</Label>
        <Select id="importance" name="importance" defaultValue="NORMAL">
          <option value="NORMAL">通常</option>
          <option value="IMPORTANT">重要</option>
        </Select>
      </div>
      <AllowedPlansCheckboxGroup defaultValue={["FREE", "STANDARD", "PREMIUM"]} />
      <label className="flex items-center gap-1.5 text-sm text-brand-green-dark">
        <input type="checkbox" name="isPublished" defaultChecked />
        公開する
      </label>
      <FieldError message={state.error} />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "投稿中..." : "お知らせを投稿する"}
    </Button>
  );
}
