/**
 * 会員種別と閲覧権限の判定ロジック。
 *
 * 重要: この関数はサーバー側（Server Component / API Route / Server Action）で
 * 必ず呼び出すこと。クライアント側の表示制御だけに頼らない（要件12対応）。
 *
 * Prisma生成型に依存させず string union で定義することで、
 * `prisma generate` を実行していない環境でもロジック単体のユニットテストが可能になる。
 */

export type MembershipPlan = "FREE" | "STANDARD" | "PREMIUM" | "ADMIN";

export const ALL_PLANS: MembershipPlan[] = ["FREE", "STANDARD", "PREMIUM", "ADMIN"];

export const PLAN_LABELS: Record<MembershipPlan, string> = {
  FREE: "無料会員",
  STANDARD: "通常会員",
  PREMIUM: "プレミアム会員",
  ADMIN: "管理者",
};

export type MemberStatus = "ACTIVE" | "SUSPENDED" | "WITHDRAWN" | "EXPIRED";

/** コンテンツの allowedPlans（カンマ区切り文字列）をパースする */
export function parseAllowedPlans(allowedPlans: string): MembershipPlan[] {
  return allowedPlans
    .split(",")
    .map((p) => p.trim())
    .filter((p): p is MembershipPlan => (ALL_PLANS as string[]).includes(p));
}

export function serializeAllowedPlans(plans: MembershipPlan[]): string {
  return plans.join(",");
}

/**
 * 会員がコンテンツを閲覧できるかどうかを判定する。
 * ADMINは常に全コンテンツを閲覧可能。
 */
export function canViewContent(
  memberPlan: MembershipPlan,
  contentAllowedPlans: string | MembershipPlan[]
): boolean {
  if (memberPlan === "ADMIN") return true;
  const allowed = Array.isArray(contentAllowedPlans)
    ? contentAllowedPlans
    : parseAllowedPlans(contentAllowedPlans);
  return allowed.includes(memberPlan);
}

/**
 * 会員がログイン・サービス利用可能な状態かどうかを判定する。
 * - 退会・一時停止・期限切れは不可
 * - 有効期限が過ぎている場合は expiresAt を見て自動判定する
 */
export function isMemberActive(status: MemberStatus, expiresAt: Date | null, now: Date = new Date()): boolean {
  if (status === "SUSPENDED" || status === "WITHDRAWN" || status === "EXPIRED") return false;
  if (expiresAt && expiresAt.getTime() < now.getTime()) return false;
  return true;
}

export function isAdmin(plan: MembershipPlan): boolean {
  return plan === "ADMIN";
}
