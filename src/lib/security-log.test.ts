import { describe, expect, it } from "vitest";
import { createSecurityLogEntry } from "@/lib/security-log";

describe("createSecurityLogEntry", () => {
  it("emits only allowlisted structured fields and fingerprints the IP", () => {
    const marker = "DO_NOT_LOG_THIS_SECRET";
    const entry = createSecurityLogEntry(
      "development_route_rejected",
      {
        route: "/api/dev/login",
        method: "GET",
        status: 404,
        environment: "live",
        ip: "198.51.100.24",
        password: marker,
        token: marker,
        body: marker,
      } as Record<string, unknown>,
      {
        now: new Date("2026-09-08T12:00:00.000Z"),
        fingerprintSecret: "test-fingerprint-secret",
      }
    );

    expect(Object.keys(entry).sort()).toEqual([
      "environment",
      "event",
      "ipFingerprint",
      "method",
      "route",
      "status",
      "timestamp",
    ]);
    expect(entry).toMatchObject({
      event: "development_route_rejected",
      timestamp: "2026-09-08T12:00:00.000Z",
      route: "/api/dev/login",
      method: "GET",
      status: 404,
      environment: "live",
    });
    expect(JSON.stringify(entry)).not.toContain(marker);
    expect(JSON.stringify(entry)).not.toContain("198.51.100.24");
    expect(entry.ipFingerprint).toMatch(/^[a-f0-9]{16}$/);
  });
});
