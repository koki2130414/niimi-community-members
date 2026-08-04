"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Label, Input, Select, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { AllowedPlansCheckboxGroup } from "@/components/admin/AllowedPlansCheckboxGroup";
import type { MembershipPlan } from "@/lib/permissions";
import type { VideoFormState } from "@/lib/actions/admin-video-actions";

interface Category {
  id: string;
  name: string;
}

interface Props {
  action: (state: VideoFormState, formData: FormData) => Promise<VideoFormState>;
  categories: Category[];
  defaultValues?: {
    title: string;
    youtubeUrl: string;
    description: string;
    categoryId: string;
    tags: string;
    isPublished: boolean;
    isFeatured: boolean;
    allowedPlans: MembershipPlan[];
  };
  submitLabel: string;
}

const initialState: VideoFormState = {};

export function VideoForm({ action, categories, defaultValues, submitLabel }: Props) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="title">タイトル</Label>
        <Input id="title" name="title" defaultValue={defaultValues?.title} required />
      </div>
      <div>
        <Label htmlFor="youtubeUrl">YouTube URL（限定公開）</Label>
        <Input id="youtubeUrl" name="youtubeUrl" defaultValue={defaultValues?.youtubeUrl} required placeholder="https://youtu.be/xxxxxxxx" />
        <p className="mt-1 text-xs text-brand-green-light">
          ⚠️ YouTube限定公開動画は、URLを知っている人が閲覧できる可能性があります。機密性の高い動画には、別の動画配信サービスや署名付きURLの利用を検討してください。
        </p>
      </div>
      <div>
        <Label htmlFor="description">説明文</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={defaultValues?.description} />
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
        <Input id="tags" name="tags" defaultValue={defaultValues?.tags} placeholder="稲作,水管理" />
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
