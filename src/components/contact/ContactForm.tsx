"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "אירעה שגיאה.");
        return;
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("אירעה שגיאה בחיבור לשרת.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500" />
        <p className="font-bold text-stone-800 text-lg">ההודעה נשלחה בהצלחה!</p>
        <p className="text-stone-500">נחזור אליך בהקדם.</p>
        <button onClick={() => setSuccess(false)} className="text-amber-700 underline text-sm mt-2">שלח הודעה נוספת</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">שם מלא *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="ישראל ישראלי"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">מייל *</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="israel@example.com"
          dir="ltr"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">הודעה *</label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          placeholder="שלום, אני מעוניין/ת..."
        />
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {loading ? "שולח..." : "שליחה"}
      </button>
    </form>
  );
}
