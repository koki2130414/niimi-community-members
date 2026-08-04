import { describe, it, expect } from "vitest";
import { isBenefitExpired, benefitDisplayLabel } from "../src/lib/content-status";
import { extractYoutubeId } from "../src/lib/validators";

describe("benefit expiry logic", () => {
  it("treats a benefit with no expiry as never expired", () => {
    expect(isBenefitExpired(null)).toBe(false);
  });

  it("marks a past validUntil date as expired", () => {
    expect(isBenefitExpired(new Date("2020-01-01"), new Date("2026-01-01"))).toBe(true);
  });

  it("shows 終了 for an expired but still-published benefit", () => {
    expect(benefitDisplayLabel(true, new Date("2020-01-01"), new Date("2026-01-01"))).toBe("終了");
  });

  it("shows 非公開 for an unpublished benefit regardless of expiry", () => {
    expect(benefitDisplayLabel(false, new Date("2030-01-01"), new Date("2026-01-01"))).toBe("非公開");
  });

  it("shows 公開中 for a published, non-expired benefit", () => {
    expect(benefitDisplayLabel(true, new Date("2030-01-01"), new Date("2026-01-01"))).toBe("公開中");
  });
});

describe("extractYoutubeId", () => {
  it("extracts the ID from a youtu.be short URL", () => {
    expect(extractYoutubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts the ID from a standard watch URL", () => {
    expect(extractYoutubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts the ID from an embed URL", () => {
    expect(extractYoutubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns null for a non-YouTube URL", () => {
    expect(extractYoutubeId("https://example.com/video")).toBeNull();
  });

  it("returns null for a malformed URL", () => {
    expect(extractYoutubeId("not-a-url")).toBeNull();
  });
});
