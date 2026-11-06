import { describe, expect, it } from "vitest";
import { isFatalDatabaseError, safeDbQuery } from "@/lib/safe-db";

describe("safeDbQuery", () => {
  it.each(["P2021", "P2022", "P3005"])("rethrows schema error %s", async (code) => {
    const error = Object.assign(new Error("schema mismatch"), { code });
    await expect(
      safeDbQuery(async () => {
        throw error;
      }, [])
    ).rejects.toBe(error);
  });

  it("uses the fallback for an explicitly transient connection failure", async () => {
    const error = Object.assign(new Error("connection unavailable"), { code: "P1001" });
    await expect(
      safeDbQuery(async () => {
        throw error;
      }, ["fallback"])
    ).resolves.toEqual(["fallback"]);
  });

  it("rethrows unknown programming errors", async () => {
    const error = new TypeError("unexpected bug");
    await expect(
      safeDbQuery(async () => {
        throw error;
      }, null)
    ).rejects.toBe(error);
  });
});

describe("isFatalDatabaseError", () => {
  it("does not classify a transient connection error as fatal", () => {
    expect(isFatalDatabaseError({ code: "P1002" })).toBe(false);
  });
});
