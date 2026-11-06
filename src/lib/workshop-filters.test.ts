import { describe, expect, it } from "vitest";
import { isPubliclyVisibleWorkshop } from "./workshop-filters";

const now = new Date("2026-11-06T12:00:00Z");

describe("isPubliclyVisibleWorkshop", () => {
  it("hides a missing workshop", () => {
    expect(isPubliclyVisibleWorkshop(null, now)).toBe(false);
  });

  it("shows an active workshop with no fixed date", () => {
    expect(isPubliclyVisibleWorkshop({ status: "active", date: null }, now)).toBe(true);
  });

  it("shows an active workshop with a future date", () => {
    expect(isPubliclyVisibleWorkshop({ status: "active", date: new Date("2026-12-01") }, now)).toBe(true);
  });

  it("hides an active workshop whose date has passed", () => {
    expect(isPubliclyVisibleWorkshop({ status: "active", date: new Date("2026-10-01") }, now)).toBe(false);
  });

  it("hides blocked and cancelled workshops", () => {
    expect(isPubliclyVisibleWorkshop({ status: "blocked", date: null }, now)).toBe(false);
    expect(isPubliclyVisibleWorkshop({ status: "cancelled", date: null }, now)).toBe(false);
  });
});
