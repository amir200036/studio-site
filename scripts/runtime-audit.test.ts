import { describe, expect, it } from "vitest";
import { evaluateAudit } from "./runtime-audit.mjs";

describe("runtime dependency audit gate", () => {
  it("fails for a high production advisory", () => {
    const decision = evaluateAudit({
      vulnerabilities: {
        unsafe: {
          severity: "high",
          via: [{ title: "example advisory", url: "https://example.test/advisory" }],
        },
      },
    });
    expect(decision.ok).toBe(false);
    expect(decision.findings).toEqual([
      { packageName: "unsafe", severity: "high", url: "https://example.test/advisory" },
    ]);
  });

  it("warns but passes for a moderate advisory", () => {
    const decision = evaluateAudit({
      vulnerabilities: {
        optionalTool: {
          severity: "moderate",
          via: [{ url: "https://example.test/moderate" }],
        },
      },
    });
    expect(decision.ok).toBe(true);
    expect(decision.findings[0].severity).toBe("moderate");
  });

  it("fails closed when the audit report is unusable", () => {
    expect(evaluateAudit({ error: "network unavailable" }).ok).toBe(false);
  });
});
