"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Workshop } from "@prisma/client";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import { adminInputClass, adminPrimaryBtnClass } from "@/lib/admin-ui";
import { GalleryImagePicker } from "./GalleryImagePicker";
import { WorkshopWhatsAppEditor } from "./WorkshopWhatsAppEditor";

interface Props {
  workshop?: Workshop;
}

export function WorkshopForm({ workshop }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(workshop?.name || "");
  const [duration, setDuration] = useState(String(workshop?.durationHours || 2));
  const [description, setDescription] = useState(workshop?.description || "");
  const [imageUrl, setImageUrl] = useState(workshop?.imageUrl || "");
  const [price, setPrice] = useState(String(workshop?.pricePerPerson || ""));
  const [maxParticipants, setMaxParticipants] = useState(String(workshop?.maxParticipants || 10));
  const [status, setStatus] = useState(workshop?.status || "active");
  const [whatsappMessage, setWhatsappMessage] = useState(workshop?.whatsappMessage || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = {
      name,
      date: null,
      durationHours: parseFloat(duration),
      description,
      imageUrl: imageUrl || null,
      pricePerPerson: parseFloat(price),
      maxParticipants: parseInt(maxParticipants, 10),
      status,
      whatsappMessage: whatsappMessage.trim() || null,
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
    if (!confirm(`האם למחוק את הסדנה "${workshop.name}"?`)) return;
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

  const durationNum = parseFloat(duration) || 0;
  const priceNum = parseFloat(price) || 0;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-4 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-stone-800 text-lg">{workshop ? "עריכת סדנה" : "סדנה חדשה"}</h2>
        {workshop && (
          <a
            href={`/workshops/${workshop.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-800 font-medium"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            צפייה בדף באתר
          </a>
        )}
      </div>

      <Field label="שם הסדנה">
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
          className={adminInputClass} placeholder="סדנת יסודות הקדרות" />
      </Field>

      <Field label="משך (שעות)">
        <input type="number" required min="0.5" step="0.5" value={duration}
          onChange={(e) => setDuration(e.target.value)} className={adminInputClass} />
      </Field>

      <Field label="תיאור">
        <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
          className={adminInputClass + " resize-none"} />
      </Field>

      <Field label="תמונה (אופציונלי)">
        <GalleryImagePicker value={imageUrl} onChange={setImageUrl} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="מחיר לאדם (₪)">
          <input type="number" required min="0" value={price} onChange={(e) => setPrice(e.target.value)}
            className={adminInputClass} />
        </Field>
        <Field label="מקסימום משתתפים">
          <input type="number" required min="1" value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)} className={adminInputClass} />
        </Field>
      </div>

      <Field label="סטטוס">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={adminInputClass + " bg-white"}>
          <option value="active">פעילה</option>
          <option value="blocked">חסומה</option>
          <option value="cancelled">מבוטלת</option>
        </select>
      </Field>

      <div className="border-t border-stone-100 pt-4">
        <label className="block text-sm font-medium text-stone-700 mb-2">הודעת WhatsApp</label>
        <WorkshopWhatsAppEditor
          value={whatsappMessage}
          onChange={setWhatsappMessage}
          workshopName={name}
          durationHours={durationNum}
          pricePerPerson={priceNum}
        />
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      <button type="submit" disabled={loading}
        className={adminPrimaryBtnClass + " w-full mt-2"}>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "שומר..." : "שמירה"}
      </button>

      {/* מחיקה הופרדה משמירה — קודם הן ישבו זו לצד זו באותה שורה */}
      {workshop && (
        <div className="mt-6 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-stone-500">מחיקת הסדנה היא לצמיתות ואי אפשר לבטל אותה.</p>
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="px-4 py-2.5 min-h-11 bg-white hover:bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-1.5">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            מחיקת הסדנה
          </button>
        </div>
      )}
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
