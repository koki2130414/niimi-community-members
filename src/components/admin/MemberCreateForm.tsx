"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createMember, type MemberFormState } from "@/lib/actions/admin-member-actions";
import { Label, Input, Select, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { PLAN_LABELS } from "@/lib/permissions";

const initialState: MemberFormState = {};

export function MemberCreateForm() {
  const [state, formAction] = useFormState(createMember, initialState);

  if (state.success && state.issuedPassword) {
    return (
      <div className="space-y-3 rounded-card border border-brand-gold bg-brand-gold-light p-4 text-sm text-brand-green-dark">
        <p className="font-bold">会員を登録しました。以下の情報を会員へお伝えください。</p>
        <p>
          ログインID: <span className="font-mono font-bold">{state.loginId}</span>
        </p>
        <p>
          仮パスワード: <span className="font-mono font-bold">{state.issuedPassword}</span>
        </p>
        <p className="text-xs">
          ※このパスワードは今だけ表示されます。画面を閉じると再表示できません（管理者は平文パスワードを閲覧できない仕様のため）。
        </p>
        <a href="/admin/members" className="inline-block text-xs font-semibold underline">
          会員一覧に戻る
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">氏名</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="displayName">表示名</Label>
        <Input id="displayName" name="displayName" required />
      </div>
      <div>
        <Label htmlFor="email">メールアドレス</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="loginId">ログインID（半角英数字, - _ .）</Label>
        <Input id="loginId" name="loginId" required />
      </div>
      <div>
        <Label htmlFor="membershipPlan">会員種別</Label>
        <Select id="membershipPlan" name="membershipPlan" defaultValue="FREE">
          {Object.entries(PLAN_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="expiresAt">有効期限（任意）</Label>
        <Input id="expiresAt" name="expiresAt" type="date" />
      </div>
      <div>
        <Label htmlFor="adminNote">管理者メモ（会員には非公開）</Label>
        <Textarea id="adminNote" name="adminNote" rows={3} />
      </div>
      <FieldError message={state.error} />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "登録中..." : "登録してログイン情報を発行する"}
    </Button>
  );
}
