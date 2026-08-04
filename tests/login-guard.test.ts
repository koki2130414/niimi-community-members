import { describe, it, expect } from "vitest";
import { isLocked, nextStateAfterFailedLogin, MAX_FAILED_ATTEMPTS } from "../src/lib/login-guard";

describe("nextStateAfterFailedLogin", () => {
  it("increments the failed count without locking below the threshold", () => {
    const result = nextStateAfterFailedLogin(0);
    expect(result.failedLoginCount).toBe(1);
    expect(result.lockedUntil).toBeNull();
  });

  it("locks the account once MAX_FAILED_ATTEMPTS is reached", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const result = nextStateAfterFailedLogin(MAX_FAILED_ATTEMPTS - 1, now);
    expect(result.failedLoginCount).toBe(MAX_FAILED_ATTEMPTS);
    expect(result.lockedUntil).not.toBeNull();
    expect(result.lockedUntil!.getTime()).toBeGreaterThan(now.getTime());
  });
});

describe("isLocked", () => {
  it("returns false when lockedUntil is null", () => {
    expect(isLocked(null)).toBe(false);
  });

  it("returns true when lockedUntil is in the future", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const future = new Date("2026-01-01T00:10:00Z");
    expect(isLocked(future, now)).toBe(true);
  });

  it("returns false when lockedUntil is in the past", () => {
    const now = new Date("2026-01-01T00:10:00Z");
    const past = new Date("2026-01-01T00:00:00Z");
    expect(isLocked(past, now)).toBe(false);
  });
});
