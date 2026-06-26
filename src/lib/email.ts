// שכבת שירות מיילים — Resend API (fetch ישיר)
import { escapeHtml } from "@/lib/sanitize";
import { STUDIO_EMAIL } from "@/lib/studio-contact";

const BRAND_NAME = "יד יוצרת";

function getFromAddress(): string {
  return process.env.RESEND_FROM || `${BRAND_NAME} <noreply@studio.co.il>`;
}

function getDefaultReplyTo(): string | undefined {
  const reply = process.env.RESEND_REPLY_TO?.trim() || STUDIO_EMAIL;
  return reply || undefined;
}

function isTestSender(from: string): boolean {
  return from.includes("@resend.dev");
}

type SendEmailOptions = {
  replyTo?: string;
  text?: string;
};

/** @returns true אם נשלח (או מצב פיתוח ללא Resend), false אם חסר נמען או שגיאת Resend */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  options: SendEmailOptions = {}
): Promise<boolean> {
  const recipient = to?.trim();
  if (!recipient) {
    console.warn("sendEmail: כתובת נמען ריקה — לא נשלח.");
    return false;
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from = getFromAddress();
  const replyTo = options.replyTo?.trim() || getDefaultReplyTo();

  if (!resendKey || resendKey === "re_...") {
    console.log("\n📧 מייל (מצב פיתוח):");
    console.log(`  אל: ${recipient}`);
    console.log(`  נושא: ${subject}`);
    if (replyTo) console.log(`  Reply-To: ${replyTo}`);
    return true;
  }

  if (isTestSender(from)) {
    console.warn(
      "⚠️ RESEND_FROM משתמש ב-resend.dev — מיילים עלולים להגיע לספאם. אמתו דומיין ב-Resend והגדירו RESEND_FROM."
    );
  }

  const payload: Record<string, unknown> = {
    from,
    to: recipient,
    subject,
    html,
    text: options.text || stripHtmlToText(html),
  };
  if (replyTo) payload.reply_to = replyTo;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("שגיאה בשליחת מייל:", err);
    return false;
  }
  return true;
}

function stripHtmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function emailShell(title: string, bodyHtml: string): string {
  return `
    <div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#fdf8f3;padding:32px;border-radius:12px;line-height:1.6">
      <p style="margin:0 0 16px;font-size:18px;font-weight:bold;color:#8B4513">${escapeHtml(BRAND_NAME)}</p>
      ${title ? `<h2 style="margin:0 0 16px;font-size:16px;color:#444">${title}</h2>` : ""}
      ${bodyHtml}
      <p style="margin:24px 0 0;font-size:12px;color:#999">סטודיו קדרות וקרמיקה · נס ציונה</p>
    </div>
  `;
}

export async function sendCancellationEmail(
  to: string,
  customerName: string,
  workshopName: string,
  workshopDate: Date | null
) {
  const safeName = escapeHtml(customerName);
  const safeWorkshop = escapeHtml(workshopName);
  const dateStr = workshopDate
    ? workshopDate.toLocaleDateString("he-IL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const whenPhrase = dateStr ? `בתאריך ${escapeHtml(dateStr)}` : "שתוכננה (מועד ב-WhatsApp)";

  const bodyHtml = `
      <p style="color:#444">שלום ${safeName},</p>
      <p style="color:#444">לצערנו, הסדנה <strong>${safeWorkshop}</strong> ${whenPhrase} בוטלה.</p>
      <p style="color:#444">לשאלות בנוגע להחזרים (אם שולמו מול הסטודיו) נשמח לעזור בוואטסאפ או במייל.</p>
      <p style="color:#444">מתנצלים על אי הנוחות ומקווים לראותך בסדנאות הקרובות.</p>
  `;
  const html = emailShell("הסדנה בוטלה", bodyHtml);
  const text = `שלום ${customerName},\n\nלצערנו, הסדנה ${workshopName} ${dateStr ? `בתאריך ${dateStr}` : ""} בוטלה.\n\n${BRAND_NAME} · נס ציונה`;

  await sendEmail(to, `ביטול סדנה — ${workshopName}`, html, { text });
}

export async function sendCustomEmail(to: string, subject: string, body: string): Promise<boolean> {
  const safeBody = escapeHtml(body);
  const html = emailShell("", `<div style="white-space:pre-wrap;color:#444">${safeBody}</div>`);
  return sendEmail(to, subject, html, { text: body });
}

/** הודעת טופס צור קשר — Reply-To מצביע על הלקוח כדי שתוכלו להשיב ישירות */
export async function sendContactFormEmail(
  adminEmail: string,
  customerName: string,
  customerEmail: string,
  message: string
): Promise<boolean> {
  const body = `שם: ${customerName}\nמייל: ${customerEmail}\n\nהודעה:\n${message}`;
  const safeBody = escapeHtml(body);
  const html = emailShell(
    "פנייה חדשה מהאתר",
    `<div style="white-space:pre-wrap;color:#444">${safeBody}</div>`
  );
  return sendEmail(adminEmail, `פנייה מהאתר — ${customerName}`, html, {
    text: body,
    replyTo: customerEmail,
  });
}
