"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createMaterial, type MaterialFormState } from "@/lib/actions/admin-material-actions";
import { Label, Input, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { AllowedPlansCheckboxGroup } from "@/components/admin/AllowedPlansCheckboxGroup";

const initialState: MaterialFormState = {};

export function MaterialCreateForm() {
  const [state, formAction] = useFormState(createMaterial, initialState);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="title">資料名</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="description">説明</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <div>
        <Label htmlFor="category">カテゴリー（任意）</Label>
        <Input id="category" name="category" />
      </div>
      <div>
        <Label htmlFor="file">ファイル（上限20MB）</Label>
        <input
          id="file"
          name="file"
          type="file"
          required
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-green file:px-3 file:py-2 file:text-white"
        />
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
      {pending ? "アップロード中..." : "資料をアップロードする"}
    </Button>
  );
}
