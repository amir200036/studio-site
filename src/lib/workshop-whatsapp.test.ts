import { describe, expect, it } from "vitest";
import { workshopInterestMessage, workshopInterestWhatsAppHref } from "./workshop-whatsapp";

const workshop = { name: "יסודות הקדרות", durationHours: 3 };

describe("workshopInterestMessage", () => {
  it("uses a short default message when no template is saved", () => {
    expect(workshopInterestMessage(workshop)).toContain("יסודות הקדרות");
  });

  it("fills a saved template", () => {
    expect(
      workshopInterestMessage({ ...workshop, whatsappMessage: "שלום! {{workshopName}} — {{durationHours}} שעות" })
    ).toBe("שלום! יסודות הקדרות — 3 שעות");
  });

  it("drops lines that need a form or show a price", () => {
    const message = workshopInterestMessage({
      ...workshop,
      whatsappMessage: [
        "שלום! {{workshopName}}",
        "שם: {{customerName}}",
        "מקומות: {{seats}}",
        "מחיר לאדם: {{pricePerPerson}}",
        "סכום: {{total}}",
      ].join("\n"),
    });
    expect(message).toBe("שלום! יסודות הקדרות");
    expect(message).not.toContain("₪");
  });

  it("falls back to the default when only form lines were saved", () => {
    expect(workshopInterestMessage({ ...workshop, whatsappMessage: "שם: {{customerName}}" })).toContain(
      "לקבל פרטים"
    );
  });
});

describe("workshopInterestWhatsAppHref", () => {
  it("builds a wa.me link with the encoded message", () => {
    const href = workshopInterestWhatsAppHref(workshop, "972525771221");
    expect(href.startsWith("https://wa.me/972525771221?text=")).toBe(true);
    expect(decodeURIComponent(href.split("text=")[1])).toContain("יסודות הקדרות");
  });
});
