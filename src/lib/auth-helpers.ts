import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { isMemberActive } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import type { Session } from "next-auth";

/**
 * 会員ページ用のガード。
 * - 未ログイン -> /login にリダイレクト
 * - 会員が停止/退会/期限切れ -> 強制サインアウトして /login にリダイレクト
 *
 * Server Component（layout）から呼び出すことで、レイアウトが描画される全ページに対して
 * 「サーバー側」で確実に権限判定を行う（要件: 権限判定はサーバー側で必ず実施）。
 */
export async function requireMemberSession(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // DBの最新状態を都度確認する（セッション発行後に停止された場合も即座に反映するため）
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.deletedAt || !isMemberActive(user.status, user.expiresAt)) {
    await signOut({ redirectTo: "/login?reason=inactive" });
    redirect("/login?reason=inactive");
  }

  return session;
}

/** 管理画面用のガード。ADMIN以外は会員トップへリダイレクトする。 */
export async function requireAdminSession(): Promise<Session> {
  const session = await requireMemberSession();
  if (session.user.membershipPlan !== "ADMIN") {
    redirect("/member");
  }
  return session;
}
