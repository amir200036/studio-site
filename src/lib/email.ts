// שכבת שירות מיילים — Resend API (fetch ישיר)

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

export async function sendCancellationEmail(
  to: string,
  customerName: string,
  workshopName: string,
  workshopDate: Date | null
) {
  const dateStr = workshopDate
    ? workshopDate.toLocaleDateString("he-IL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
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

export async function sendCustomEmail(to: string, subject: string, body: string): Promise<boolean> {
  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fdf8f3;padding:32px;border-radius:12px">
      <h1 style="color:#8B4513">סטודיו קדרות 🏺</h1>
      <div style="white-space:pre-wrap;color:#444">${body}</div>
    </div>
  `;
  return sendEmail(to, subject, html);
}
