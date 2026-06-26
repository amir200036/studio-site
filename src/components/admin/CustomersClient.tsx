"use client";

import { useState } from "react";
import { Mail, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { adminInputClass, adminPrimaryBtnClass, adminTouchBtnClass } from "@/lib/admin-ui";
import { formatPrice } from "@/lib/utils";

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  seats: number;
  totalAmount: number;
  createdAt: Date;
  workshop: { name: string; date: Date | null };
}

interface Customer {
  name: string;
  email: string;
  bookings: Booking[];
  total: number;
}

interface Props {
  customers: Customer[];
}

export function CustomersClient({ customers }: Props) {
  const [search, setSearch] = useState("");
  const [openEmail, setOpenEmail] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  const filtered = customers.filter(
    (c) =>
      c.name.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  async function sendEmail(to: string) {
    setSending(true);
    const res = await fetch("/api/admin/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, body }),
    });
    setSending(false);
    setMsg(res.ok ? "✅ נשלח!" : "❌ שגיאה");
    setTimeout(() => { setMsg(""); setOpenEmail(null); }, 2000);
  }

  async function sendNewsletter() {
    setSending(true);
    const res = await fetch("/api/admin/email/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    setSending(false);
    setMsg(res.ok ? `✅ נשלח ל-${customers.length} לקוחות!` : "❌ שגיאה");
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">לקוחות</h1>
          <p className="text-stone-400 mt-1">{customers.length} לקוחות</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/admin/export/customers"
            className="text-sm font-bold text-amber-800 hover:text-amber-900 px-4 py-3 min-h-12 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors inline-flex items-center"
          >
            הורדת CSV
          </a>
          <button onClick={() => setNewsletterOpen(!newsletterOpen)}
            className={`${adminPrimaryBtnClass} text-sm px-4`}>
            <Mail className="w-4 h-4" /> ניוזלטר לכולם
          </button>
        </div>
      </div>

      {newsletterOpen && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-3">
          <h2 className="font-bold text-stone-800">שליחת ניוזלטר לכל הלקוחות</h2>
          <input placeholder="נושא" value={subject} onChange={(e) => setSubject(e.target.value)} className={adminInputClass} />
          <textarea placeholder="תוכן ההודעה..." rows={4} value={body} onChange={(e) => setBody(e.target.value)} className={adminInputClass + " resize-none"} />
          {msg && <p className="text-sm">{msg}</p>}
          <button onClick={sendNewsletter} disabled={sending}
            className={adminPrimaryBtnClass + " text-sm w-full sm:w-auto"}>
            {sending && <Loader2 className="w-4 h-4 animate-spin" />}
            שלח לכולם
          </button>
        </div>
      )}

      <input type="search" placeholder="חיפוש לפי שם או מייל..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        className={adminInputClass + " max-w-sm"} />

      <div className="flex flex-col gap-3">
        {filtered.map((c) => (
          <div key={c.email} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-4 gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-stone-800">{c.name}</div>
                <div className="text-stone-400 text-xs truncate" dir="ltr">{c.email}</div>
                <div className="text-xs text-stone-500 mt-1 sm:hidden">
                  {c.bookings.length} הזמנות · <span className="font-bold text-amber-700">{formatPrice(c.total)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-stone-400">{c.bookings.length} הזמנות</div>
                  <div className="font-bold text-amber-700 text-sm">{formatPrice(c.total)}</div>
                </div>
                <button onClick={() => setOpenEmail(openEmail === c.email ? null : c.email)}
                  className={adminTouchBtnClass + " hover:bg-amber-50 text-amber-600"} title="שלח מייל">
                  <Mail className="w-5 h-5" />
                </button>
                <button onClick={() => setExpanded(expanded === c.email ? null : c.email)}
                  className={adminTouchBtnClass + " hover:bg-stone-50 text-stone-600"}>
                  {expanded === c.email ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {openEmail === c.email && (
              <div className="px-5 pb-4 border-t border-stone-50 flex flex-col gap-2 pt-3">
                <input placeholder="נושא" value={subject} onChange={(e) => setSubject(e.target.value)} className={adminInputClass} />
                <textarea placeholder="הודעה..." rows={3} value={body} onChange={(e) => setBody(e.target.value)} className={adminInputClass + " resize-none"} />
                {msg && <p className="text-sm">{msg}</p>}
                <button onClick={() => sendEmail(c.email)} disabled={sending}
                  className={adminPrimaryBtnClass + " text-sm w-full"}>
                  {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} שלח
                </button>
              </div>
            )}

            {expanded === c.email && (
              <div className="px-5 pb-4 border-t border-stone-50 pt-3">
                <h3 className="text-sm font-semibold text-stone-600 mb-2">היסטוריית הזמנות</h3>
                {c.bookings.map((b) => (
                  <div key={b.id} className="flex justify-between text-xs text-stone-500 py-1.5 border-b border-stone-50 last:border-0">
                    <span>{b.workshop.name}</span>
                    <span>{formatPrice(b.totalAmount)} · {b.seats} מקומות</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
