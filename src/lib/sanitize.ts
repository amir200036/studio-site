/** Escape text for safe insertion into HTML email bodies */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email) && email.length <= 254;
}

/** Block internal hosts in user-supplied image URLs (SSRF mitigation for next/image) */
export function isAllowedImageUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  const t = url.trim();
  if (t.startsWith("/uploads/")) return !t.includes("..");
  try {
    const u = new URL(t);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.endsWith(".local") ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * סריאליזציה בטוחה ל-<script type="application/ld+json">.
 * JSON.stringify לא מברח "<", ולכן טקסט מהמסד שמכיל "</script>" היה
 * סוגר את התגית ומאפשר הזרקת סקריפט.
 */
export function toJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
