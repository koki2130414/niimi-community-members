import { describe, it, expect } from "vitest";
import { canViewContent, isMemberActive, parseAllowedPlans } from "../src/lib/permissions";

describe("canViewContent", () => {
  it("allows a plan explicitly listed in allowedPlans", () => {
    expect(canViewContent("STANDARD", "FREE,STANDARD,PREMIUM")).toBe(true);
  });

  it("denies a plan not listed in allowedPlans", () => {
    expect(canViewContent("FREE", "PREMIUM,ADMIN")).toBe(false);
  });

  it("always allows ADMIN regardless of allowedPlans", () => {
    expect(canViewContent("ADMIN", "PREMIUM")).toBe(true);
  });

  it("accepts an already-parsed array of plans", () => {
    expect(canViewContent("PREMIUM", ["PREMIUM"])).toBe(true);
  });
});

describe("parseAllowedPlans", () => {
  it("parses a comma-separated string, trimming whitespace", () => {
    expect(parseAllowedPlans("FREE, STANDARD ,PREMIUM")).toEqual(["FREE", "STANDARD", "PREMIUM"]);
  });

  it("drops invalid/unknown plan values", () => {
    expect(parseAllowedPlans("FREE,BOGUS")).toEqual(["FREE"]);
  });
});

describe("isMemberActive", () => {
  it("returns false for suspended members", () => {
    expect(isMemberActive("SUSPENDED", null)).toBe(false);
  });

  it("returns false for withdrawn members", () => {
    expect(isMemberActive("WITHDRAWN", null)).toBe(false);
  });

  it("returns false when expiresAt is in the past", () => {
    const past = new Date("2020-01-01");
    expect(isMemberActive("ACTIVE", past, new Date("2026-01-01"))).toBe(false);
  });

  it("returns true when expiresAt is in the future", () => {
    const future = new Date("2030-01-01");
    expect(isMemberActive("ACTIVE", future, new Date("2026-01-01"))).toBe(true);
  });

  it("returns true when there is no expiry date", () => {
    expect(isMemberActive("ACTIVE", null)).toBe(true);
  });
});
