"use client";

import { useState, useTransition } from "react";
import { issueTemporaryPassword } from "@/lib/actions/admin-member-actions";
import { Button } from "@/components/ui/Button";

export function IssueTempPasswordButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [issuedPassword, setIssuedPassword] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        disabled={isPending}
        onClick={() => {
          if (!confirm("この会員に新しい仮パスワードを発行します。現在のパスワードは無効になります。よろしいですか？")) return;
          startTransition(async () => {
            const result = await issueTemporaryPassword(userId);
            setIssuedPassword(result.issuedPassword ?? null);
          });
        }}
      >
        {isPending ? "発行中..." : "仮パスワードを発行する"}
      </Button>
      {issuedPassword && (
        <p className="rounded-card border border-brand-gold bg-brand-gold-light p-3 text-xs text-brand-green-dark">
          新しい仮パスワード: <span className="font-mono font-bold">{issuedPassword}</span>
          <br />
          ※この画面を離れると再表示できません。会員に安全な方法でお伝えください。
        </p>
      )}
    </div>
  );
}
