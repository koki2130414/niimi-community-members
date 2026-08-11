"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { Label, Input, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { LessonFormState } from "@/lib/actions/admin-course-actions";

export function LessonForm({ action }: { action: (formData: FormData) => Promise<LessonFormState> }) {
  const router = useRouter();
  const [sourceType, setSourceType] = useState<"youtube" | "upload" | "none">("youtube");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    formData.set("videoSourceType", sourceType);

    if (sourceType === "upload" && file) {
      setUploading(true);
      setProgress(0);
      try {
        const blob = await upload(file.name, file, {
          access: "private",
          handleUploadUrl: "/api/videos/upload",
          onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
        });
        formData.set("filePath", blob.pathname);
        formData.set("fileMimeType", file.type);
      } catch {
        setUploading(false);
        setError("動画のアップロードに失敗しました");
        return;
      }
      setUploading(false);
    }

    setSubmitting(true);
    const result = await action(formData);
    setSubmitting(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setFile(null);
      router.refresh();
    }
  }

  const busy = uploading || submitting;

  return (
    <form action={handleSubmit} className="space-y-3 rounded-card border border-dashed border-brand-beige bg-brand-cream/40 p-4">
      <p className="text-sm font-bold text-brand-green-dark">レッスンを追加</p>
      <div>
        <Label htmlFor="lessonTitle">レッスンタイトル</Label>
        <Input id="lessonTitle" name="title" required />
      </div>

      <div>
        <Label>動画の種類</Label>
        <div className="flex gap-3 text-sm text-brand-green-dark">
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={sourceType === "youtube"} onChange={() => setSourceType("youtube")} />
            YouTube動画を埋め込む
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={sourceType === "upload"} onChange={() => setSourceType("upload")} />
            動画ファイルをアップロード
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={sourceType === "none"} onChange={() => setSourceType("none")} />
            動画なし（テキストのみ）
          </label>
        </div>
      </div>

      {sourceType === "youtube" && (
        <div>
          <Label htmlFor="youtubeUrl">YouTube URL</Label>
          <Input id="youtubeUrl" name="youtubeUrl" placeholder="https://www.youtube.com/watch?v=..." />
        </div>
      )}

      {sourceType === "upload" && (
        <div>
          <Label htmlFor="lessonFile">動画ファイル</Label>
          <input
            id="lessonFile"
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full rounded-lg border border-brand-beige px-3 py-2 text-sm text-brand-green-dark file:mr-3 file:rounded-full file:border-0 file:bg-brand-green file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
          {uploading && (
            <div className="mt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-brand-beige">
                <div className="h-full bg-brand-green transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-xs text-brand-green-light">アップロード中… {progress}%</p>
            </div>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="bodyHtml">補足テキスト（任意・HTML）</Label>
        <Textarea id="bodyHtml" name="bodyHtml" rows={3} />
      </div>
      <div>
        <Label htmlFor="pdfUrl">PDF資料URL（任意）</Label>
        <Input id="pdfUrl" name="pdfUrl" />
      </div>

      <FieldError message={error} />
      <Button type="submit" disabled={busy}>
        {uploading ? `アップロード中… ${progress}%` : submitting ? "追加中..." : "レッスンを追加する"}
      </Button>
    </form>
  );
}
