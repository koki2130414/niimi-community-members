"use client";

import { useTransition } from "react";
import { suspendMember, reactivateMember } from "@/lib/actions/admin-member-actions";
import { Button } from "@/components/ui/Button";

export function MemberStatusToggleButton({ userId, isActive }: { userId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={isActive ? "danger" : "secondary"}
      disabled={isPending}
      onClick={() => {
        const message = isActive ? "この会員を一時停止します。よろしいですか？" : "この会員を有効に戻します。よろしいですか？";
        if (!confirm(message)) return;
        startTransition(async () => {
          if (isActive) {
            await suspendMember(userId);
          } else {
            await reactivateMember(userId);
          }
        });
      }}
    >
      {isPending ? "処理中..." : isActive ? "この会員を一時停止する" : "この会員を有効化する"}
    </Button>
  );
}
