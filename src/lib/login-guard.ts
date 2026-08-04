/**
 * ブルートフォース攻撃対策のロジック。
 * 一定回数ログインに失敗したアカウントを、一定時間ロックする。
 */

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_DURATION_MINUTES = 15;

export function isLocked(lockedUntil: Date | null, now: Date = new Date()): boolean {
  if (!lockedUntil) return false;
  return lockedUntil.getTime() > now.getTime();
}

/**
 * ログイン失敗後の次の状態を計算する。
 * MAX_FAILED_ATTEMPTS 回に達したらロックする。
 */
export function nextStateAfterFailedLogin(
  currentFailedCount: number,
  now: Date = new Date()
): { failedLoginCount: number; lockedUntil: Date | null } {
  const failedLoginCount = currentFailedCount + 1;
  if (failedLoginCount >= MAX_FAILED_ATTEMPTS) {
    return {
      failedLoginCount,
      lockedUntil: new Date(now.getTime() + LOCK_DURATION_MINUTES * 60 * 1000),
    };
  }
  return { failedLoginCount, lockedUntil: null };
}

/** ログイン成功時にリセットする状態 */
export function stateAfterSuccessfulLogin() {
  return { failedLoginCount: 0, lockedUntil: null as Date | null };
}
