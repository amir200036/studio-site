"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Workshop } from "@prisma/client";
import { Loader2, Trash2 } from "lucide-react";

interface Props {
  workshop?: Workshop;
}

export function WorkshopForm({ workshop }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(workshop?.name || "");
  const [date, setDate] = useState(
    workshop ? new Date(workshop.date).toISOString().slice(0, 16) : ""
  );
  const [duration, setDuration] = useState(String(workshop?.durationHours || 2));
  const [description, setDescription] = useState(workshop?.description || "");
  const [imageUrl, setImageUrl] = useState(workshop?.imageUrl || "");
  const [price, setPrice] = useState(String(workshop?.pricePerPerson || ""));
  const [maxParticipants, setMaxParticipants] = useState(String(workshop?.maxParticipants || 10));
  const [status, setStatus] = useState(workshop?.status || "active");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = {
      name,
      date: new Date(date).toISOString(),
      durationHours: parseFloat(duration),
      description,
      imageUrl: imageUrl || null,
      pricePerPerson: parseFloat(price),
      maxParticipants: parseInt(maxParticipants, 10),
      status,
    };

    const url = workshop ? `/api/admin/workshops/${workshop.id}` : "/api/admin/workshops";
    const method = workshop ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/admin/workshops");
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error || "שגיאה בשמירה.");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!workshop) return;
    if (!confirm(`האם למחוק את הסדנה "${workshop.name}"? פעולה זו תשלח מייל לכל הנרשמים.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/workshops/${workshop.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/workshops");
      router.refresh();
    } else {
      setError("שגיאה במחיקה.");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-4">
      <h2 className="font-bold text-stone-800 text-lg">{workshop ? "עריכת פרטים" : "פרטי הסדנה"}</h2>

      <Field label="שם הסדנה">
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
          className={inputClass} placeholder="סדנת יסודות הקדרות" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="תאריך ושעה">
          <input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)}
            className={inputClass} dir="ltr" />
        </Field>
        <Field label="משך (שעות)">
          <input type="number" required min="0.5" step="0.5" value={duration}
            onChange={(e) => setDuration(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <Field label="תיאור">
        <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
          className={inputClass + " resize-none"} />
      </Field>

      <Field label="כתובת URL לתמונה">
        <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
          className={inputClass} placeholder="https://..." dir="ltr" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="מחיר לאדם (₪)">
          <input type="number" required min="0" value={price} onChange={(e) => setPrice(e.target.value)}
            className={inputClass} />
        </Field>
        <Field label="מקסימום משתתפים">
          <input type="number" required min="1" value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <Field label="סטטוס">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass + " bg-white"}>
          <option value="active">פעילה</option>
          <option value="blocked">חסומה</option>
          <option value="cancelled">מבוטלת</option>
        </select>
      </Field>

      {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 mt-2">
        <button type="submit" disabled={loading}
          className="flex-1 py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "שומר..." : "שמירה"}
        </button>

        {workshop && (
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors flex items-center gap-1.5">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            מחיקה
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent";
