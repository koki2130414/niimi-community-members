"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateMember, type MemberFormState } from "@/lib/actions/admin-member-actions";
import { Label, Input, Select, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { PLAN_LABELS } from "@/lib/permissions";

const initialState: MemberFormState = {};

interface Props {
  id: string;
  name: string;
  displayName: string;
  email: string;
  membershipPlan: string;
  status: string;
  expiresAt: string; // yyyy-mm-dd or ""
  adminNote: string;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "有効" },
  { value: "SUSPENDED", label: "一時停止" },
  { value: "WITHDRAWN", label: "退会" },
  { value: "EXPIRED", label: "有効期限切れ" },
];

export function MemberEditForm(props: Props) {
  const [state, formAction] = useFormState(updateMember, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={props.id} />
      <div>
        <Label htmlFor="name">氏名</Label>
        <Input id="name" name="name" defaultValue={props.name} required />
      </div>
      <div>
        <Label htmlFor="displayName">表示名</Label>
        <Input id="displayName" name="displayName" defaultValue={props.displayName} required />
      </div>
      <div>
        <Label htmlFor="email">メールアドレス</Label>
        <Input id="email" name="email" type="email" defaultValue={props.email} required />
      </div>
      <div>
        <Label htmlFor="membershipPlan">会員種別</Label>
        <Select id="membershipPlan" name="membershipPlan" defaultValue={props.membershipPlan}>
          {Object.entries(PLAN_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="status">会員ステータス</Label>
        <Select id="status" name="status" defaultValue={props.status}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="expiresAt">有効期限</Label>
        <Input id="expiresAt" name="expiresAt" type="date" defaultValue={props.expiresAt} />
      </div>
      <div>
        <Label htmlFor="adminNote">管理者メモ（会員には非公開）</Label>
        <Textarea id="adminNote" name="adminNote" rows={3} defaultValue={props.adminNote} />
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
