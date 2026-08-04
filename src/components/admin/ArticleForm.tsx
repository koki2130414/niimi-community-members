"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Label, Input, Select, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { AllowedPlansCheckboxGroup } from "@/components/admin/AllowedPlansCheckboxGroup";
import type { MembershipPlan } from "@/lib/permissions";
import type { ArticleFormState } from "@/lib/actions/admin-article-actions";

interface Category {
  id: string;
  name: string;
}

interface Props {
  action: (state: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
  categories: Category[];
  defaultValues?: {
    title: string;
    summary: string;
    bodyHtml: string;
    categoryId: string;
    tags: string;
    authorName: string;
    isPublished: boolean;
    isFeatured: boolean;
    allowedPlans: MembershipPlan[];
  };
  submitLabel: string;
}

const initialState: ArticleFormState = {};

export function ArticleForm({ action, categories, defaultValues, submitLabel }: Props) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="title">タイトル</Label>
        <Input id="title" name="title" defaultValue={defaultValues?.title} required />
      </div>
      <div>
        <Label htmlFor="summary">要約</Label>
        <Textarea id="summary" name="summary" rows={2} defaultValue={defaultValues?.summary} />
      </div>
      <div>
        <Label htmlFor="bodyHtml">本文（HTML）</Label>
        <Textarea id="bodyHtml" name="bodyHtml" rows={12} defaultValue={defaultValues?.bodyHtml} required className="font-mono text-xs" />
        <p className="mt-1 text-xs text-brand-green-light">
          利用可能なタグ: 見出し(h2,h3) 太字(strong) 箇条書き(ul/li) 画像(img) リンク(a) YouTube埋め込み(iframe) 引用(blockquote)
          区切り線(hr)。保存時に自動で安全なタグのみへサニタイズされます。
        </p>
      </div>
      <div>
        <Label htmlFor="categoryId">カテゴリー</Label>
        <Select id="categoryId" name="categoryId" defaultValue={defaultValues?.categoryId ?? ""}>
          <option value="">未分類</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="tags">タグ（カンマ区切り）</Label>
        <Input id="tags" name="tags" defaultValue={defaultValues?.tags} />
      </div>
      <div>
        <Label htmlFor="authorName">執筆者</Label>
        <Input id="authorName" name="authorName" defaultValue={defaultValues?.authorName} />
      </div>
      <AllowedPlansCheckboxGroup defaultValue={defaultValues?.allowedPlans ?? ["FREE", "STANDARD", "PREMIUM"]} />
      <div className="flex gap-4">
        <label className="flex items-center gap-1.5 text-sm text-brand-green-dark">
          <input type="checkbox" name="isPublished" defaultChecked={defaultValues?.isPublished} />
          公開する
        </label>
        <label className="flex items-center gap-1.5 text-sm text-brand-green-dark">
          <input type="checkbox" name="isFeatured" defaultChecked={defaultValues?.isFeatured} />
          おすすめに設定
        </label>
      </div>
      <FieldError message={state.error} />
      <SubmitButton label={submitLabel} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "保存中..." : label}
    </Button>
  );
}
