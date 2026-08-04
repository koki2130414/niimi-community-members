/**
 * 特典・イベントなどの「期限切れ」自動判定ロジック。
 * 管理者が公開設定を変更しなくても、期限が過ぎたものは自動的に「終了」表示になる。
 */

export function isBenefitExpired(validUntil: Date | null, now: Date = new Date()): boolean {
  if (!validUntil) return false;
  return validUntil.getTime() < now.getTime();
}

export function benefitDisplayLabel(
  isPublished: boolean,
  validUntil: Date | null,
  now: Date = new Date()
): "終了" | "公開中" | "非公開" {
  if (!isPublished) return "非公開";
  if (isBenefitExpired(validUntil, now)) return "終了";
  return "公開中";
}

export type EventStatus = "UPCOMING" | "OPEN" | "FULL" | "CLOSED" | "FINISHED" | "CANCELED";

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  UPCOMING: "受付前",
  OPEN: "受付中",
  FULL: "満員",
  CLOSED: "受付終了",
  FINISHED: "開催終了",
  CANCELED: "中止",
};
