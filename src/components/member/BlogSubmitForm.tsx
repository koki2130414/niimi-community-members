"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitMemberBlogPost } from "@/lib/actions/checkin-actions";
import { Label, Input, Textarea, FieldError } from "@/components/ui/FormField";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark disabled:opacity-60"
    >
      {pending ? "投稿中…" : "ブログを投稿する"}
    </button>
  );
}

export function BlogSubmitForm() {
  const [state, formAction] = useFormState(submitMemberBlogPost, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="title">タイトル</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="summary">要約（任意）</Label>
        <Input id="summary" name="summary" />
      </div>
      <div>
        <Label htmlFor="bodyHtml">本文</Label>
        <Textarea id="bodyHtml" name="bodyHtml" rows={8} required placeholder="改行はそのまま段落として表示されます" />
      </div>
      <div>
        <Label htmlFor="externalUrl">note.com記事のリンク（任意）</Label>
        <Input id="externalUrl" name="externalUrl" placeholder="https://note.com/..." />
        <p className="mt-1 text-xs text-brand-green-light">note.comに全文を書いている場合、リンクを入れると記事に「元記事を読む」ボタンが表示されます。</p>
      </div>
      {state?.error && <FieldError message={state.error} />}
      {state?.success && <p className="text-xs font-semibold text-brand-green">投稿しました！ブログに公開されました。</p>}
      <SubmitButton />
    </form>
  );
}
