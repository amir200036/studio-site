/** מספר WhatsApp (ספרות בלבד): ערך מהאדמין גובר על משתנה הסביבה */
export function resolveWhatsAppNumber(storedValue?: string | null): string {
  const stored = storedValue?.replace(/\D/g, "") ?? "";
  if (stored) return stored;
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
}
