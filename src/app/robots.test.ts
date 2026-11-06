import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "./robots";

afterEach(() => vi.unstubAllEnvs());

describe("robots", () => {
  it("keeps /admin and /api/ out of every crawler group in production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://studio.example");
    const rules = robots().rules;
    const groups = Array.isArray(rules) ? rules : [rules];
    expect(groups.length).toBeGreaterThan(1);
    for (const group of groups) {
      expect(group.disallow).toEqual(expect.arrayContaining(["/admin", "/api/"]));
    }
  });

  it("blocks everything outside production", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(robots().rules).toEqual([{ userAgent: "*", disallow: "/" }]);
  });
});
