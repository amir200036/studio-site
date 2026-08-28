"use client";

import Link from "next/link";
import { useState } from "react";
import type { FAQ, Event, GalleryImage, Review } from "@prisma/client";
import { Loader2, Trash2, Plus, Pencil, Save } from "lucide-react";
import { GalleryImagePicker } from "./GalleryImagePicker";
import { adminInputClass, adminPrimaryBtnClass, adminTouchBtnClass } from "@/lib/admin-ui";
import { StickySaveBar } from "./StickySaveBar";
import { DEFAULT_TERMS } from "@/lib/default-terms";

interface Props {
  content: Record<string, string>;
  faqs: FAQ[];
  events: Event[];
  gallery: GalleryImage[];
  reviews: Review[];
}

type Tab = "hero" | "faq" | "events" | "reviews" | "backgrounds" | "hours" | "terms";

const TAB_META: Record<Tab, { title: string; description: string }> = {
  hero: {
    title: "דף בית",
    description: "כותרות, טקסט על הסטודיו וסטטיסטיקות. לבחירת תמונה — מספריית התמונות בסרגל.",
  },
  faq: {
    title: "שאלות נפוצות",
    description: "הוספה ומחיקה של שאלות ותשובות.",
  },
  events: {
    title: "אירועים מיוחדים",
    description: "אירועים שמוצגים בעמוד האירועים. תמונות — מספריית התמונות בסרגל.",
  },
  reviews: {
    title: "ביקורות",
    description: "ביקורות לקוחות שמוצגות בדף הבית.",
  },
  backgrounds: {
    title: "רקעים",
    description: "צבע רקע כללי ותמונות רקע לכל דף — מספריית התמונות בסרגל.",
  },
  hours: {
    title: "שעות פעילות",
    description: "מוצג בעמוד 'צרו קשר'. שורה לכל יום.",
  },
  terms: {
    title: "תקנון",
    description: "תוכן עמוד התקנון.",
  },
};

function TabSectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-stone-200 pb-4">
      <h2 className="text-xl font-bold text-stone-800">{title}</h2>
      <p className="text-sm text-stone-500 mt-1">{description}</p>
    </div>
  );
}

export function ContentClient({ content, faqs: initFaqs, events: initEvents, gallery: initGallery, reviews: initReviews }: Props) {
  const [tab, setTab] = useState<Tab>("hero");
  const [gallery, setGallery] = useState(initGallery);

  const tabs: { key: Tab; label: string }[] = [
    { key: "hero", label: "דף בית" },
    { key: "faq", label: "שאלות נפוצות" },
    { key: "events", label: "אירועים" },
    { key: "reviews", label: "ביקורות" },
    { key: "backgrounds", label: "רקעים" },
    { key: "hours", label: "שעות פעילות" },
    { key: "terms", label: "תקנון" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">ניהול תוכן</h1>
        <p className="text-sm text-stone-500 mt-1">
          העלאה וניהול תמונות — ב{" "}
          <Link href="/admin/gallery" className="text-amber-700 hover:text-amber-800 font-medium underline-offset-2 hover:underline">
            ספריית תמונות
          </Link>{" "}
          בסרגל העליון.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-colors min-h-11 shrink-0 ${tab === t.key ? "bg-amber-700 text-white" : "bg-white text-stone-600 hover:bg-amber-50 border border-stone-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <TabSectionHeader title={TAB_META[tab].title} description={TAB_META[tab].description} />

      {tab === "hero" && <HeroTab content={content} gallery={gallery} onGalleryUpdate={setGallery} />}
      {tab === "faq" && <FAQTab initFaqs={initFaqs} />}
      {tab === "events" && <EventsTab initEvents={initEvents} gallery={gallery} onGalleryUpdate={setGallery} />}
      {tab === "reviews" && <ReviewsTab initReviews={initReviews} />}
      {tab === "backgrounds" && <BackgroundsTab content={content} gallery={gallery} onGalleryUpdate={setGallery} />}
      {tab === "hours" && <HoursTab content={content} />}
      {tab === "terms" && <TermsTab content={content} />}
    </div>
  );
}

// --- דף בית ---
function HeroTab({
  content,
  gallery,
  onGalleryUpdate,
}: {
  content: Record<string, string>;
  gallery: GalleryImage[];
  onGalleryUpdate: (g: GalleryImage[]) => void;
}) {
  // תוויות בעברית פשוטה — "Hero" ו-"About" הם מונחי מפתחים, לא של בעל הסטודיו
  const fields: { key: string; label: string; type: string; hint?: string }[] = [
    { key: "hero_title", label: "כותרת ראשית", type: "text", hint: "המשפט הגדול בראש דף הבית" },
    { key: "hero_subtitle", label: "משפט משנה", type: "text" },
    { key: "hero_cta", label: "טקסט הכפתור הראשי", type: "text" },
    { key: "about_title", label: "כותרת 'על הסטודיו'", type: "text" },
    { key: "about_text", label: "טקסט 'על הסטודיו'", type: "textarea" },
    { key: "about_image", label: "תמונה לצד 'על הסטודיו'", type: "imageUpload" },
    { key: "stat_years", label: "שנות ניסיון", type: "text" },
    { key: "stat_students", label: "מספר תלמידים", type: "text" },
    { key: "stat_workshops", label: "מספר סדנאות", type: "text" },
  ];

  const initial = Object.fromEntries(fields.map((f) => [f.key, content[f.key] || ""]));
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [saved, setSaved] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) setSaved(values);
    setMsg(res.ok ? "✅ נשמר!" : "❌ שגיאה בשמירה");
    setTimeout(() => setMsg(""), 2500);
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-4 max-w-4xl">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            {f.label}
            {f.hint && <span className="font-normal text-stone-400"> — {f.hint}</span>}
          </label>
          {f.type === "textarea" ? (
            <textarea rows={4} value={values[f.key]} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className={adminInputClass + " resize-none"} />
          ) : f.type === "imageUpload" ? (
            <GalleryImagePicker
              value={values[f.key]}
              onChange={(url) => setValues({ ...values, [f.key]: url })}
              gallery={gallery}
              onGalleryUpdate={onGalleryUpdate}
            />
          ) : (
            <input type={f.type} value={values[f.key]} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className={adminInputClass} dir={f.type === "url" ? "ltr" : undefined} />
          )}
        </div>
      ))}

      <StickySaveBar dirty={dirty} saving={saving} message={msg} onSave={save} />
    </div>
  );
}

// --- שאלות נפוצות ---
function FAQTab({ initFaqs }: { initFaqs: FAQ[] }) {
  const [faqs, setFaqs] = useState(initFaqs);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [loading, setLoading] = useState(false);

  async function add() {
    if (!newQ || !newA) return;
    setLoading(true);
    const res = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: newQ, answer: newA, order: faqs.length }),
    });
    const faq = await res.json();
    setFaqs([...faqs, faq]);
    setNewQ(""); setNewA("");
    setLoading(false);
  }

  async function remove(id: string) {
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    setFaqs(faqs.filter((f) => f.id !== id));
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {faqs.map((f) => (
        <div key={f.id} className="bg-white rounded-2xl p-4 border border-stone-100 flex justify-between items-start gap-4">
          <div>
            <p className="font-semibold text-stone-800 text-sm">{f.question}</p>
            <p className="text-stone-500 text-sm mt-1">{f.answer}</p>
          </div>
          <button onClick={() => remove(f.id)} className={adminTouchBtnClass + " text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"}>
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
      <div className="bg-white rounded-2xl p-5 border border-stone-100 flex flex-col gap-3">
        <h3 className="font-bold text-stone-800">הוספת שאלה</h3>
        <input placeholder="שאלה" value={newQ} onChange={(e) => setNewQ(e.target.value)} className={adminInputClass} />
        <textarea placeholder="תשובה" rows={3} value={newA} onChange={(e) => setNewA(e.target.value)} className={adminInputClass + " resize-none"} />
        <button onClick={add} disabled={loading} className={adminPrimaryBtnClass + " w-full"}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} הוסף שאלה
        </button>
      </div>
    </div>
  );
}

// --- אירועים ---
function EventsTab({
  initEvents,
  gallery,
  onGalleryUpdate,
}: {
  initEvents: Event[];
  gallery: GalleryImage[];
  onGalleryUpdate: (g: GalleryImage[]) => void;
}) {
  const [events, setEvents] = useState(initEvents);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImg, setEditImg] = useState("");
  const [editWa, setEditWa] = useState("");
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!name || !desc) return;
    setLoading(true);
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: desc, imageUrl: img || null, order: events.length }),
    });
    const ev = await res.json();
    setEvents([...events, ev]);
    setName(""); setDesc(""); setImg("");
    setLoading(false);
  }

  async function remove(id: string) {
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    setEvents(events.filter((e) => e.id !== id));
  }

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setEvents(events.map((e) => e.id === id ? { ...e, active: !active } : e));
  }

  function startEdit(e: Event) {
    setEditingId(e.id);
    setEditName(e.name);
    setEditDesc(e.description);
    setEditImg(e.imageUrl || "");
    setEditWa(e.whatsappMessage || "");
  }

  async function saveEdit(id: string) {
    setSaving(true);
    const res = await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc, imageUrl: editImg || null, whatsappMessage: editWa || null }),
    });
    const updated = await res.json();
    setEvents(events.map((e) => e.id === id ? { ...e, ...updated } : e));
    setEditingId(null);
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {events.map((e) => (
        <div key={e.id} className="bg-white rounded-2xl p-4 border border-stone-100 flex flex-col gap-3">
          {editingId === e.id ? (
            <>
              <input value={editName} onChange={(ev) => setEditName(ev.target.value)} className={adminInputClass} placeholder="שם האירוע" />
              <textarea rows={3} value={editDesc} onChange={(ev) => setEditDesc(ev.target.value)} className={adminInputClass + " resize-none"} placeholder="תיאור" />
              <div>
                <label className="block text-xs text-stone-500 mb-1">תמונה (אופציונלי)</label>
                <GalleryImagePicker value={editImg} onChange={setEditImg} gallery={gallery} onGalleryUpdate={onGalleryUpdate} />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">הודעת WhatsApp מותאמת (אופציונלי)</label>
                <input value={editWa} onChange={(ev) => setEditWa(ev.target.value)} className={adminInputClass} placeholder={`היי! אני מעוניין/ת לשמוע על ${editName} 🏺`} />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={() => saveEdit(e.id)} disabled={saving}
                  className={adminPrimaryBtnClass + " flex-1 w-full sm:w-auto"}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} שמור
                </button>
                <button onClick={() => setEditingId(null)}
                  className="px-4 py-3 min-h-12 bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium rounded-xl text-base sm:text-sm transition-colors">
                  ביטול
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="font-semibold text-stone-800 text-sm">{e.name}</p>
                <p className="text-stone-400 text-xs mt-0.5 line-clamp-2">{e.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggle(e.id, e.active)}
                  className={`px-3 py-2 min-h-11 rounded-full text-xs font-medium ${e.active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                  {e.active ? "פעיל" : "מוסתר"}
                </button>
                <button onClick={() => startEdit(e)} className={adminTouchBtnClass + " text-amber-500 hover:text-amber-700 hover:bg-amber-50"}>
                  <Pencil className="w-5 h-5" />
                </button>
                <button onClick={() => remove(e.id)} className={adminTouchBtnClass + " text-red-400 hover:text-red-600 hover:bg-red-50"}>
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="bg-white rounded-2xl p-5 border border-stone-100 flex flex-col gap-3">
        <h3 className="font-bold text-stone-800">הוספת אירוע</h3>
        <input placeholder="שם האירוע" value={name} onChange={(e) => setName(e.target.value)} className={adminInputClass} />
        <textarea placeholder="תיאור" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} className={adminInputClass + " resize-none"} />
        <div>
          <label className="block text-xs text-stone-500 mb-1">תמונה (אופציונלי)</label>
          <GalleryImagePicker value={img} onChange={setImg} gallery={gallery} onGalleryUpdate={onGalleryUpdate} />
        </div>
        <button onClick={add} disabled={loading} className={adminPrimaryBtnClass + " w-full"}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} הוסף אירוע
        </button>
      </div>
    </div>
  );
}

// --- ביקורות ---
function ReviewsTab({ initReviews }: { initReviews: Review[] }) {
  const [reviews, setReviews] = useState(initReviews.filter((r) => r.approved));
  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [loading, setLoading] = useState(false);

  async function add() {
    if (!newName || !newContent) return;
    setLoading(true);
    const res = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorName: newName, content: newContent, rating: newRating }),
    });
    const review = await res.json();
    setReviews([...reviews, review]);
    setNewName(""); setNewContent(""); setNewRating(5);
    setLoading(false);
  }

  async function remove(id: string) {
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    setReviews(reviews.filter((r) => r.id !== id));
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {reviews.map((r) => (
        <div key={r.id} className="bg-white rounded-2xl p-4 border border-stone-100 flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-stone-800 text-sm">{r.authorName}</p>
              <span className="text-amber-400 text-xs">{"★".repeat(r.rating)}</span>
            </div>
            <p className="text-stone-500 text-sm">{r.content}</p>
          </div>
          <button onClick={() => remove(r.id)} className={adminTouchBtnClass + " text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"}>
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}

      <div className="bg-white rounded-2xl p-5 border border-stone-100 flex flex-col gap-3">
        <h3 className="font-bold text-stone-800">הוספת ביקורת</h3>
        <input placeholder="שם הלקוח/ה" value={newName} onChange={(e) => setNewName(e.target.value)} className={adminInputClass} />
        <textarea placeholder="תוכן הביקורת" rows={3} value={newContent} onChange={(e) => setNewContent(e.target.value)} className={adminInputClass + " resize-none"} />
        <div className="flex items-center gap-3">
          <label className="text-sm text-stone-600">דירוג:</label>
          {[1,2,3,4,5].map((n) => (
            <button key={n} type="button" onClick={() => setNewRating(n)}
              className={`min-h-11 min-w-11 inline-flex items-center justify-center text-2xl transition-colors ${n <= newRating ? "text-amber-400" : "text-stone-200"}`}>
              ★
            </button>
          ))}
        </div>
        <button onClick={add} disabled={loading} className={adminPrimaryBtnClass + " w-full"}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} הוסף ביקורת
        </button>
      </div>
    </div>
  );
}

// --- תקנון --- (ברירת מחדל ב-src/lib/default-terms.ts)

function TermsTab({ content }: { content: Record<string, string> }) {
  const initial = content["terms_content"] || DEFAULT_TERMS;
  const [text, setText] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const dirty = text !== saved;

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terms_content: text }),
    });
    setSaving(false);
    if (res.ok) setSaved(text);
    setMsg(res.ok ? "✅ נשמר!" : "❌ שגיאה בשמירה");
    setTimeout(() => setMsg(""), 2500);
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-4 max-w-4xl">
      <div>
        <p className="text-sm text-stone-500 mb-1">עצבו את תוכן התקנון. השתמשו ב-<code className="bg-stone-100 px-1 rounded">**כותרת**</code> לכותרות סעיפים ושורה ריקה בין פסקאות.</p>
        <a href="/terms" target="_blank" className="text-xs text-amber-600 hover:underline">צפייה בתקנון ←</a>
      </div>
      <textarea
        rows={28}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={adminInputClass + " resize-y font-mono text-xs leading-relaxed"}
        dir="rtl"
      />
      <StickySaveBar dirty={dirty} saving={saving} message={msg} onSave={save} />
    </div>
  );
}

// --- שעות פעילות (היה דף /admin/settings שלם עבור שדה יחיד) ---
function HoursTab({ content }: { content: Record<string, string> }) {
  const initial = content["hours"] || "";
  const [text, setText] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const dirty = text !== saved;

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours: text }),
    });
    setSaving(false);
    if (res.ok) setSaved(text);
    setMsg(res.ok ? "✅ נשמר!" : "❌ שגיאה בשמירה");
    setTimeout(() => setMsg(""), 2500);
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-4 max-w-4xl">
      <div>
        <p className="text-sm text-stone-500 mb-1">שורה לכל יום, למשל: ראשון–חמישי: 09:00–20:00</p>
        <a href="/contact" target="_blank" className="text-xs text-amber-600 hover:underline">צפייה בעמוד צרו קשר ←</a>
      </div>
      <textarea
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={adminInputClass + " resize-y leading-relaxed"}
        placeholder={"ראשון–חמישי: 09:00–20:00\nשישי: 09:00–14:00\nשבת: סגור"}
        dir="rtl"
      />
      <StickySaveBar dirty={dirty} saving={saving} message={msg} onSave={save} />
    </div>
  );
}

// --- רקעים ---
function BackgroundsTab({
  content,
  gallery,
  onGalleryUpdate,
}: {
  content: Record<string, string>;
  gallery: GalleryImage[];
  onGalleryUpdate: (g: GalleryImage[]) => void;
}) {
  const pages = [
    { imgKey: "bg_image_home", label: "דף בית" },
    { imgKey: "bg_image_workshops", label: "סדנאות" },
    { imgKey: "bg_image_events", label: "אירועים מיוחדים" },
    { imgKey: "bg_image_faq", label: "שאלות נפוצות" },
    { imgKey: "bg_image_contact", label: "צרו קשר ומידע" },
  ];

  const allKeys = ["global_bg_color", "hero_text_color", ...pages.map((p) => p.imgKey)];
  const initial = Object.fromEntries(
    allKeys.map((k) => [
      k,
      content[k] || (k === "global_bg_color" ? "#fdf8f0" : k === "hero_text_color" ? "#78350f" : ""),
    ])
  );
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [saved, setSaved] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  function set(key: string, val: string) { setValues((v) => ({ ...v, [key]: val })); }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) setSaved(values);
    setMsg(res.ok ? "✅ נשמר!" : "❌ שגיאה בשמירה");
    setTimeout(() => setMsg(""), 2500);
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-6 max-w-4xl">
      <p className="text-sm text-stone-500">
        הצבע הכללי חל על כל האתר. תמונת רקע לדף ספציפי תכסה את הצבע. בחרו תמונה מספריית התמונות.
      </p>

      {/* Global bg color */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-stone-700 w-28">צבע רקע</label>
        <input
          type="color"
          value={values["global_bg_color"]}
          onChange={(e) => set("global_bg_color", e.target.value)}
          className="w-10 h-10 rounded-lg border border-stone-200 cursor-pointer p-0.5 bg-white"
        />
        <span className="text-xs text-stone-400 font-mono">{values["global_bg_color"]}</span>
        <button type="button" onClick={() => set("global_bg_color", "#fdf8f0")} className="text-xs text-stone-400 hover:text-stone-600 underline">איפוס</button>
      </div>

      {/* hero_text_color נקרא ב-HeroSection מאז ומעולם, אבל לא הייתה שום דרך להגדיר אותו */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-stone-700 w-28">צבע כותרת</label>
        <input
          type="color"
          value={values["hero_text_color"]}
          onChange={(e) => set("hero_text_color", e.target.value)}
          className="w-10 h-10 rounded-lg border border-stone-200 cursor-pointer p-0.5 bg-white"
        />
        <span className="text-xs text-stone-400 font-mono">{values["hero_text_color"]}</span>
        <button type="button" onClick={() => set("hero_text_color", "#78350f")} className="text-xs text-stone-400 hover:text-stone-600 underline">איפוס</button>
      </div>

      {pages.map((p) => (
        <div key={p.imgKey} className="flex flex-col gap-2 pb-4 border-b border-stone-100 last:border-0">
          <p className="text-sm font-semibold text-stone-700">{p.label}</p>
          <div className="flex items-start gap-3">
            <label className="text-xs text-stone-500 w-20 pt-2.5">תמונת רקע</label>
            <GalleryImagePicker
              value={values[p.imgKey]}
              onChange={(url) => set(p.imgKey, url)}
              gallery={gallery}
              onGalleryUpdate={onGalleryUpdate}
            />
          </div>
          {values[p.imgKey] && (
            <div className="h-16 rounded-xl overflow-hidden border border-stone-200 ms-[5.5rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={values[p.imgKey]} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      ))}
      <StickySaveBar dirty={dirty} saving={saving} message={msg} onSave={save} />
    </div>
  );
}
