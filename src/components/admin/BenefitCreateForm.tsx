"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createBenefit, type BenefitFormState } from "@/lib/actions/admin-benefit-actions";
import { Label, Input, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { AllowedPlansCheckboxGroup } from "@/components/admin/AllowedPlansCheckboxGroup";

const initialState: BenefitFormState = {};

export function BenefitCreateForm() {
  const [state, formAction] = useFormState(createBenefit, initialState);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="title">特典名</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="summary">概要</Label>
        <Textarea id="summary" name="summary" rows={2} />
      </div>
      <div>
        <Label htmlFor="detailHtml">詳細</Label>
        <Textarea id="detailHtml" name="detailHtml" rows={3} />
      </div>
      <div>
        <Label htmlFor="conditions">利用条件</Label>
        <Input id="conditions" name="conditions" />
      </div>
      <div>
        <Label htmlFor="howTo">利用方法</Label>
        <Input id="howTo" name="howTo" />
      </div>
      <div>
        <Label htmlFor="couponCode">クーポンコード（任意）</Label>
        <Input id="couponCode" name="couponCode" />
      </div>
      <div>
        <Label htmlFor="validUntil">利用期限（任意）</Label>
        <Input id="validUntil" name="validUntil" type="date" />
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
      {pending ? "登録中..." : "特典を登録する"}
    </Button>
  );
}
