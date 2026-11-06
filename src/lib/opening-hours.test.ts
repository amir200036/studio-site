import { describe, expect, it } from "vitest";
import { parseOpeningHours } from "./opening-hours";

describe("parseOpeningHours", () => {
  it("parses the seeded hours text", () => {
    expect(parseOpeningHours("ראשון–חמישי: 09:00–20:00\nשישי: 09:00–14:00\nשבת: סגור")).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Friday"],
        opens: "09:00",
        closes: "14:00",
      },
    ]);
  });

  it("accepts short day names, 'יום' prefix, plain hyphens and single-digit hours", () => {
    expect(parseOpeningHours("א׳-ה׳: 9:30-18:00\nיום שישי: 08:00 - 13:00")).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:30",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Friday"],
        opens: "08:00",
        closes: "13:00",
      },
    ]);
  });

  it("returns null for empty input", () => {
    expect(parseOpeningHours("")).toBeNull();
    expect(parseOpeningHours(undefined)).toBeNull();
  });

  it("returns null when any line cannot be parsed", () => {
    expect(parseOpeningHours("ראשון–חמישי: 09:00–20:00\nבתיאום מראש")).toBeNull();
    expect(parseOpeningHours("ראשון–חמישי: בבקרים")).toBeNull();
    expect(parseOpeningHours("חמישי–ראשון: 09:00–20:00")).toBeNull();
  });

  it("returns null when every day is closed", () => {
    expect(parseOpeningHours("שבת: סגור")).toBeNull();
  });
});
