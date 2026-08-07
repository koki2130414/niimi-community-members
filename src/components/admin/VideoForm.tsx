"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
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
  action: (formData: FormData) => Promise<VideoFormState>;
  categories: Category[];
  defaultValues?: {
    title: string;
    description: string;
    categoryId: string;
    tags: string;
    isPublished: boolean;
    isFeatured: boolean;
    allowedPlans: MembershipPlan[];
    hasExistingFile: boolean;
  };
  submitLabel: string;
}

export function VideoForm({ action, categories, defaultValues, submitLabel }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit(formData: FormData) {
    setError(undefined);

    let filePath: string | undefined;
    let fileMimeType: string | undefined;
    let fileSizeBytes: number | undefined;

    if (file) {
      setUploading(true);
      setProgress(0);
      try {
        const blob = await upload(file.name, file, {
          access: "private",
          handleUploadUrl: "/api/videos/upload",
          onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
        });
        filePath = blob.pathname;
        fileMimeType = file.type;
        fileSizeBytes = file.size;
      } catch (e) {
        setUploading(false);
        setError("動画のアップロードに失敗しました。もう一度お試しください。");
        return;
      }
      setUploading(false);
    } else if (!defaultValues?.hasExistingFile) {
      setError("動画ファイルを選択してください");
      return;
    }

    if (filePath) formData.set("filePath", filePath);
    if (fileMimeType) formData.set("fileMimeType", fileMimeType);
    if (fileSizeBytes) formData.set("fileSizeBytes", String(fileSizeBytes));

    setSubmitting(true);
    const result = await action(formData);
    setSubmitting(false);
    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/admin/videos");
      router.refresh();
    }
  }

  const busy = uploading || submitting;

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">タイトル</Label>
        <Input id="title" name="title" defaultValue={defaultValues?.title} required />
      </div>

      <div>
        <Label htmlFor="file">動画ファイル{defaultValues?.hasExistingFile ? "（変更する場合のみ選択）" : ""}</Label>
        <input
          id="file"
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full rounded-lg border border-brand-beige px-3 py-2 text-sm text-brand-green-dark file:mr-3 file:rounded-full file:border-0 file:bg-brand-green file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white"
        />
        <p className="mt-1 text-xs text-brand-green-light">
          ✅ アップロードされた動画は会員ログイン必須で配信され、サイト外（YouTube等）からは一切視聴できません。
        </p>
        {uploading && (
          <div className="mt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-brand-beige">
              <div className="h-full bg-brand-green transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-brand-green-light">アップロード中… {progress}%</p>
          </div>
        )}
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
      <FieldError message={error} />
      <Button type="submit" disabled={busy}>
        {uploading ? `アップロード中… ${progress}%` : submitting ? "保存中..." : submitLabel}
      </Button>
    </form>
  );
}
