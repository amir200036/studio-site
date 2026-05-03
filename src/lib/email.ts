// שכבת שירות מיילים — Resend בלבד

interface BookingInfo {
  customerName: string;
  customerEmail: string;
  workshopName: string;
  workshopDate: Date | null;
  seats: number;
  totalAmount: number;
}

function formatWorkshopDateTimeHe(d: Date | null | undefined): string {
  if (d == null) return "מועד יתואם ב-WhatsApp";
  return d.toLocaleDateString("he-IL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** @returns true אם נשלח (או מצב פיתוח ללא Resend), false אם חסר נמען או שגיאת Resend */
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const recipient = to?.trim();
  if (!recipient) {
    console.warn("sendEmail: כתובת נמען ריקה — לא נשלח.");
    return false;
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "סטודיו קדרות <noreply@studio.co.il>";

  if (!resendKey || resendKey === "re_...") {
    console.log("\n📧 מייל (מצב פיתוח):");
    console.log(`  אל: ${recipient}`);
    console.log(`  נושא: ${subject}`);
    return true;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: recipient, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("שגיאה בשליחת מייל:", err);
    return false;
  }
  return true;
}

export async function sendBookingConfirmation(booking: BookingInfo) {
  const dateStr = formatWorkshopDateTimeHe(booking.workshopDate);

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const waLink = `https://wa.me/${waNumber}`;

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fdf8f3;padding:32px;border-radius:12px">
      <h1 style="color:#8B4513">סטודיו קדרות 🏺</h1>
      <h2 style="color:#5a3820">הרשמתך אושרה!</h2>
      <p>שלום ${booking.customerName},</p>
      <p>תודה על הרשמתך! אנחנו שמחים לראותך בסדנה.</p>
      <div style="background:#fff;border-right:4px solid #c9a87c;padding:16px;margin:24px 0;border-radius:8px">
        <h3 style="color:#8B4513;margin-top:0">פרטי הסדנה</h3>
        <p><strong>סדנה:</strong> ${booking.workshopName}</p>
        <p><strong>תאריך:</strong> ${dateStr}</p>
        <p><strong>מספר מקומות:</strong> ${booking.seats}</p>
        <p><strong>סכום ששולם:</strong> ₪${booking.totalAmount}</p>
      </div>
      <a href="${waLink}" style="display:inline-block;background:#25D366;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">פתח WhatsApp 💬</a>
      <p style="color:#888;font-size:14px;margin-top:32px">מחכים לפגוש אותך! 🏺</p>
    </div>
  `;

  await sendEmail(booking.customerEmail, `אישור הרשמה — ${booking.workshopName}`, html);
}

export async function sendAdminNotification(booking: BookingInfo) {
  const adminEmail = process.env.ADMIN_EMAIL || "";
  const dateStr = formatWorkshopDateTimeHe(booking.workshopDate);

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px">
      <h2 style="color:#8B4513">🎉 הרשמה חדשה!</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;font-weight:bold">שם:</td><td>${booking.customerName}</td></tr>
        <tr style="background:#fdf8f3"><td style="padding:8px;font-weight:bold">מייל:</td><td>${booking.customerEmail}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">סדנה:</td><td>${booking.workshopName}</td></tr>
        <tr style="background:#fdf8f3"><td style="padding:8px;font-weight:bold">תאריך:</td><td>${dateStr}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">מקומות:</td><td>${booking.seats}</td></tr>
        <tr style="background:#fdf8f3"><td style="padding:8px;font-weight:bold">סכום:</td><td>₪${booking.totalAmount}</td></tr>
      </table>
    </div>
  `;

  await sendEmail(adminEmail, `הרשמה חדשה — ${booking.workshopName}`, html);
}

export async function sendCancellationEmail(
  to: string,
  customerName: string,
  workshopName: string,
  workshopDate: Date | null
) {
  const dateStr = workshopDate
    ? workshopDate.toLocaleDateString("he-IL", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    : null;
  const whenPhrase = dateStr ? `בתאריך ${dateStr}` : "שתוכננה (מועד ב-WhatsApp)";

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fdf8f3;padding:32px;border-radius:12px">
      <h1 style="color:#8B4513">סטודיו קדרות 🏺</h1>
      <h2 style="color:#c0392b">הסדנה בוטלה</h2>
      <p>שלום ${customerName},</p>
      <p>לצערנו, הסדנה <strong>${workshopName}</strong> ${whenPhrase} בוטלה.</p>
      <p>לשאלות בנוגע להחזרים (אם שולמו מול הסטודיו) נשמח לעזור בוואטסאפ או במייל.</p>
      <p>מתנצלים על אי הנוחות ומקווים לראותך בסדנאות הקרובות! 🏺</p>
    </div>
  `;

  await sendEmail(to, `ביטול סדנה — ${workshopName}`, html);
}

interface RefundInfo {
  customerName: string;
  customerEmail: string;
  workshopName: string;
  workshopDate: Date | null;
  totalAmount: number;
  refundId: string | null;
}

export async function sendRefundNotification(info: RefundInfo) {
  const dateStr = info.workshopDate
    ? info.workshopDate.toLocaleDateString("he-IL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "מועד ב-WhatsApp";

  const customerHtml = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fdf8f3;padding:32px;border-radius:12px">
      <h1 style="color:#8B4513">סטודיו קדרות 🏺</h1>
      <h2 style="color:#c0392b">הרשמתך בוטלה</h2>
      <p>שלום ${info.customerName},</p>
      <p>הרשמתך לסדנה <strong>${info.workshopName}</strong> (${dateStr}) בוטלה.</p>
      <p>הכסף בסך <strong>₪${info.totalAmount}</strong> יוחזר לכרטיס האשראי שלך תוך <strong>3–5 ימי עסקים</strong>.</p>
      <p style="color:#888;font-size:14px;margin-top:24px">מקווים לראותך בסדנאות הקרובות! 🏺</p>
    </div>
  `;

  const adminEmail = process.env.ADMIN_EMAIL || "";
  const adminHtml = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px">
      <h2 style="color:#c0392b">🔴 ביטול הרשמה ו-החזר כסף</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;font-weight:bold">לקוח:</td><td>${info.customerName}</td></tr>
        <tr style="background:#fdf8f3"><td style="padding:8px;font-weight:bold">מייל:</td><td>${info.customerEmail}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">סדנה:</td><td>${info.workshopName}</td></tr>
        <tr style="background:#fdf8f3"><td style="padding:8px;font-weight:bold">תאריך:</td><td>${dateStr}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">סכום שהוחזר:</td><td>₪${info.totalAmount}</td></tr>
        <tr style="background:#fdf8f3"><td style="padding:8px;font-weight:bold">מזהה החזר:</td><td dir="ltr">${info.refundId || "ידני"}</td></tr>
      </table>
    </div>
  `;

  await Promise.all([
    sendEmail(info.customerEmail, `ביטול הרשמה — ${info.workshopName}`, customerHtml),
    sendEmail(adminEmail, `ביטול הרשמה — ${info.customerName} / ${info.workshopName}`, adminHtml),
  ]);
}

interface WebhookFailureInfo {
  reason: string;
  sessionId: string;
  customerName: string;
  customerEmail: string;
  workshopName: string;
  refunded: boolean;
}

export async function sendWebhookFailureNotification(info: WebhookFailureInfo) {
  const adminEmail = process.env.ADMIN_EMAIL || "";
  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff3cd;border-radius:12px">
      <h2 style="color:#c0392b">⚠️ שגיאה בעיבוד תשלום</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;font-weight:bold">סיבה:</td><td style="color:#c0392b">${info.reason}</td></tr>
        <tr style="background:#fafafa"><td style="padding:8px;font-weight:bold">מזהה סשן:</td><td dir="ltr">${info.sessionId}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">לקוח:</td><td>${info.customerName} (${info.customerEmail})</td></tr>
        <tr style="background:#fafafa"><td style="padding:8px;font-weight:bold">סדנה:</td><td>${info.workshopName}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">הוחזר:</td><td>${info.refunded ? "✅ כן" : "❌ לא — נדרשת פעולה ידנית"}</td></tr>
      </table>
    </div>
  `;
  await sendEmail(adminEmail, `⚠️ שגיאת תשלום — ${info.workshopName}`, html);
}

export async function sendCustomEmail(to: string, subject: string, body: string): Promise<boolean> {
  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fdf8f3;padding:32px;border-radius:12px">
      <h1 style="color:#8B4513">סטודיו קדרות 🏺</h1>
      <div style="white-space:pre-wrap;color:#444">${body}</div>
    </div>
  `;
  return sendEmail(to, subject, html);
}
