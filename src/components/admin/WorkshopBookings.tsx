"use client";

import { useState } from "react";
import type { Booking } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { Loader2, Mail, RotateCcw, X } from "lucide-react";
import { adminInputClass, adminPrimaryBtnClass } from "@/lib/admin-ui";

interface Props {
  bookings: Booking[];
  workshopId: string;
  workshopName: string;
  workshopDate: Date | null;
}

interface ConfirmState {
  bookingId: string;
  customerName: string;
  totalAmount: number;
}

export function WorkshopBookings({ bookings: initialBookings, workshopId }: Props) {
  const [bookings, setBookings] = useState(initialBookings);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addSeats, setAddSeats] = useState(1);
  const [adding, setAdding] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState("");

  const activeBookings = bookings.filter((b) => b.paymentStatus === "paid");
  const cancelledBookings = bookings.filter((b) => b.paymentStatus === "refunded" || b.paymentStatus === "cancelled");
  const totalSeats = activeBookings.reduce((s, b) => s + b.seats, 0);

  async function addManual(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    const res = await fetch(`/api/admin/workshops/${workshopId}/add-booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: addName, customerEmail: addEmail, seats: addSeats }),
    });
    setAdding(false);
    if (res.ok) {
      setMsg("✅ לקוח נוסף בהצלחה");
      setAddName(""); setAddEmail(""); setAddSeats(1);
      setTimeout(() => window.location.reload(), 800);
    } else {
      setMsg("❌ שגיאה בהוספה");
    }
  }

  async function sendEmailAll() {
    setEmailLoading(true);
    const res = await fetch(`/api/admin/workshops/${workshopId}/email`, { method: "POST" });
    setEmailLoading(false);
    setMsg(res.ok ? "✅ מיילים נשלחו" : "❌ שגיאה בשליחה");
  }

  async function confirmRefund() {
    if (!confirm) return;
    setRefunding(true);
    setRefundError("");
    try {
      const res = await fetch(`/api/admin/bookings/${confirm.bookingId}/refund`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setRefundError(data.error || "שגיאה בביטול ההזמנה.");
        setRefunding(false);
        return;
      }
      // עדכון מקומי — מסמן כ-refunded בלי reload
      setBookings((prev) =>
        prev.map((b) =>
          b.id === confirm.bookingId ? { ...b, paymentStatus: "refunded", cancelledAt: new Date() } as Booking : b
        )
      );
      setConfirm(null);
      setMsg("✅ ההרשמה בוטלה במערכת");
    } catch {
      setRefundError("שגיאה בחיבור לשרת.");
    } finally {
      setRefunding(false);
    }
  }

  return (
    <>
      {/* חלון אישור ביטול */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button onClick={() => { setConfirm(null); setRefundError(""); }}
              className="absolute top-4 left-4 p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
              <X className="w-4 h-4 text-stone-500" />
            </button>
            <div className="text-3xl mb-3 text-center">⚠️</div>
            <h3 className="font-bold text-stone-800 text-center mb-2">אישור ביטול הרשמה</h3>
            <p className="text-stone-600 text-sm text-center mb-4 leading-relaxed">
              האם לבטל את הרשמתו של <strong>{confirm.customerName}</strong>
              {confirm.totalAmount > 0 ? (
                <>
                  {" "}
                  (סכום רשום במערכת: <strong>{formatPrice(confirm.totalAmount)}</strong>)?
                </>
              ) : (
                "?"
              )}
              <br />
              <span className="text-red-600 font-medium">פעולה זו אינה הפיכה — החזר כספי (אם רלוונטי) יבוצע ידנית מול הלקוח.</span>
            </p>
            {refundError && (
              <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg mb-3 text-center">{refundError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirm(null); setRefundError(""); }}
                disabled={refunding}
                className="flex-1 py-3 min-h-12 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-base sm:text-sm transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={confirmRefund}
                disabled={refunding}
                className="flex-1 py-3 min-h-12 bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white font-bold rounded-xl text-base sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {refunding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {refunding ? "מעבד..." : "כן, בטל הרשמה"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* רשימת נרשמים */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h2 className="font-bold text-stone-800 text-lg">נרשמים ({totalSeats} מקומות)</h2>
            <button onClick={sendEmailAll} disabled={emailLoading}
              className="flex items-center justify-center gap-2 text-sm px-4 py-3 min-h-11 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition-colors w-full sm:w-auto">
              {emailLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
              שלח מייל לכולם
            </button>
          </div>

          {msg && <p className="text-sm mb-3">{msg}</p>}

          {activeBookings.length === 0 ? (
            <p className="text-stone-400 text-sm">אין נרשמים פעילים</p>
          ) : (
            <div className="flex flex-col gap-1">
              {activeBookings.map((b) => (
                <div key={b.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm py-3 border-b border-stone-50 last:border-0 gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-stone-700">{b.customerName}</div>
                    <div className="text-stone-400 text-xs break-all">{b.customerEmail}</div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-amber-700">{formatPrice(b.totalAmount)}</div>
                      <div className="text-stone-400 text-xs">{b.seats} מקומות</div>
                    </div>
                    <button
                      onClick={() => setConfirm({ bookingId: b.id, customerName: b.customerName, totalAmount: b.totalAmount })}
                      className="flex items-center justify-center gap-1.5 text-sm px-4 py-2.5 min-h-11 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-medium"
                      title="ביטול הרשמה במערכת"
                    >
                      <RotateCcw className="w-4 h-4" />
                      ביטול
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* הזמנות מבוטלות */}
          {cancelledBookings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-100">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">בוטלו</h3>
              <div className="flex flex-col gap-1">
                {cancelledBookings.map((b) => (
                  <div key={b.id} className="flex justify-between items-center text-sm py-2 gap-2 opacity-50">
                    <div className="min-w-0">
                      <div className="font-medium text-stone-500 truncate line-through">{b.customerName}</div>
                      <div className="text-stone-400 text-xs truncate">{b.customerEmail}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-stone-400 text-xs line-through">{formatPrice(b.totalAmount)}</div>
                      </div>
                      <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-medium">בוטל</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* הוספה ידנית */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <h2 className="font-bold text-stone-800 text-lg mb-4">הוספת לקוח ידנית</h2>
          <form onSubmit={addManual} className="flex flex-col gap-3">
            <input type="text" required placeholder="שם מלא" value={addName} onChange={(e) => setAddName(e.target.value)}
              className={adminInputClass} />
            <input type="email" required placeholder="מייל" value={addEmail} onChange={(e) => setAddEmail(e.target.value)}
              className={adminInputClass} dir="ltr" />
            <select value={addSeats} onChange={(e) => setAddSeats(Number(e.target.value))} className={adminInputClass + " bg-white"}>
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} מקומות</option>)}
            </select>
            <button type="submit" disabled={adding}
              className={adminPrimaryBtnClass + " bg-stone-700 hover:bg-stone-800 text-sm w-full"}>
              {adding && <Loader2 className="w-4 h-4 animate-spin" />}
              הוסף לקוח
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
