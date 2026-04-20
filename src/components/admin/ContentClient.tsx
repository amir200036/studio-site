"use client";

import { useState } from "react";
import type { FAQ, Event, GalleryImage, Review } from "@prisma/client";
import { Loader2, Trash2, Plus, Pencil, Save } from "lucide-react";
import { ImageUploadField } from "./ImageUploadField";

interface Props {
  content: Record<string, string>;
  faqs: FAQ[];
  events: Event[];
  gallery: GalleryImage[];
  reviews: Review[];
}

type Tab = "hero" | "faq" | "events" | "gallery" | "reviews" | "backgrounds" | "terms";

export function ContentClient({ content, faqs: initFaqs, events: initEvents, gallery: initGallery, reviews: initReviews }: Props) {
  const [tab, setTab] = useState<Tab>("hero");

  const tabs: { key: Tab; label: string }[] = [
    { key: "hero", label: "דף בית" },
    { key: "faq", label: "שאלות נפוצות" },
    { key: "events", label: "אירועים" },
    { key: "gallery", label: "גלריה" },
    { key: "reviews", label: "ביקורות" },
    { key: "backgrounds", label: "רקעים" },
    { key: "terms", label: "תקנון" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-stone-800">ניהול תוכן</h1>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${tab === t.key ? "bg-amber-700 text-white" : "bg-white text-stone-600 hover:bg-amber-50 border border-stone-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "hero" && <HeroTab content={content} />}
      {tab === "faq" && <FAQTab initFaqs={initFaqs} />}
      {tab === "events" && <EventsTab initEvents={initEvents} />}
      {tab === "gallery" && <GalleryTab initGallery={initGallery} />}
      {tab === "reviews" && <ReviewsTab initReviews={initReviews} />}
      {tab === "backgrounds" && <BackgroundsTab content={content} />}
      {tab === "terms" && <TermsTab content={content} />}
    </div>
  );
}

// --- דף בית ---
function HeroTab({ content }: { content: Record<string, string> }) {
  const fields: { key: string; label: string; type: string }[] = [
    { key: "hero_title", label: "כותרת Hero", type: "text" },
    { key: "hero_subtitle", label: "תת-כותרת Hero", type: "text" },
    { key: "hero_cta", label: "טקסט כפתור Hero", type: "text" },
    { key: "about_title", label: "כותרת 'על הסטודיו'", type: "text" },
    { key: "about_text", label: "טקסט על הסטודיו", type: "textarea" },
    { key: "about_image", label: "תמונת About", type: "imageUpload" },
    { key: "stat_years", label: "שנות ניסיון", type: "text" },
    { key: "stat_students", label: "מספר תלמידים", type: "text" },
    { key: "stat_workshops", label: "מספר סדנאות", type: "text" },
  ];

  const colorFields = [
    { key: "hero_text_color", label: "צבע כיתוב Hero", default: "#78350f" },
  ];

  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries([
      ...fields.map((f) => [f.key, content[f.key] || ""]),
      ...colorFields.map((f) => [f.key, content[f.key] || f.default]),
    ])
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    setMsg(res.ok ? "✅ נשמר!" : "❌ שגיאה");
    setTimeout(() => setMsg(""), 2000);
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-4 max-w-2xl">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-medium text-stone-700 mb-1">{f.label}</label>
          {f.type === "textarea" ? (
            <textarea rows={4} value={values[f.key]} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className={ic + " resize-none"} />
          ) : f.type === "imageUpload" ? (
            <>
              <ImageUploadField value={values[f.key]} onChange={(url) => setValues({ ...values, [f.key]: url })} />
              {values[f.key] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={values[f.key]} alt="" className="mt-2 h-24 rounded-xl object-cover border border-stone-200" />
              )}
            </>
          ) : (
            <input type={f.type} value={values[f.key]} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className={ic} dir={f.type === "url" ? "ltr" : undefined} />
          )}
        </div>
      ))}

      {/* Color pickers */}
      <div className="border-t border-stone-100 pt-4 flex flex-col gap-3">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">צבע כיתוב Hero</p>
        <p className="text-xs text-stone-400">צבע הרקע מוגדר בטאב "רקעים" תחת "צבע כללי"</p>
        {colorFields.map((f) => (
          <div key={f.key} className="flex items-center gap-3">
            <label className="text-sm font-medium text-stone-700 w-36">{f.label}</label>
            <input
              type="color"
              value={values[f.key]}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className="w-10 h-10 rounded-lg border border-stone-200 cursor-pointer p-0.5 bg-white"
            />
            <span className="text-xs text-stone-400 font-mono">{values[f.key]}</span>
            <button
              type="button"
              onClick={() => setValues({ ...values, [f.key]: f.default })}
              className="text-xs text-stone-400 hover:text-stone-600 underline"
            >
              איפוס
            </button>
          </div>
        ))}
        <div
          className="rounded-xl p-4 text-center font-bold text-xl mt-1 bg-amber-50"
          style={{ color: values["hero_text_color"] }}
        >
          תצוגה מקדימה של כיתוב
        </div>
      </div>

      {msg && <p className="text-sm">{msg}</p>}
      <button onClick={save} disabled={saving}
        className="py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />} שמירה
      </button>
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
          <button onClick={() => remove(f.id)} className="text-red-400 hover:text-red-600 flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <div className="bg-white rounded-2xl p-5 border border-stone-100 flex flex-col gap-3">
        <h3 className="font-bold text-stone-800">הוספת שאלה</h3>
        <input placeholder="שאלה" value={newQ} onChange={(e) => setNewQ(e.target.value)} className={ic} />
        <textarea placeholder="תשובה" rows={3} value={newA} onChange={(e) => setNewA(e.target.value)} className={ic + " resize-none"} />
        <button onClick={add} disabled={loading} className="py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} הוסף שאלה
        </button>
      </div>
    </div>
  );
}

// --- אירועים ---
function EventsTab({ initEvents }: { initEvents: Event[] }) {
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
              <input value={editName} onChange={(ev) => setEditName(ev.target.value)} className={ic} placeholder="שם האירוע" />
              <textarea rows={3} value={editDesc} onChange={(ev) => setEditDesc(ev.target.value)} className={ic + " resize-none"} placeholder="תיאור" />
              <div>
                <label className="block text-xs text-stone-500 mb-1">תמונה (אופציונלי)</label>
                <ImageUploadField value={editImg} onChange={setEditImg} placeholder="URL תמונה (אופציונלי)" />
                {editImg && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={editImg} alt="" className="mt-2 h-20 rounded-xl object-cover border border-stone-200" />
                )}
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">הודעת WhatsApp מותאמת (אופציונלי)</label>
                <input value={editWa} onChange={(ev) => setEditWa(ev.target.value)} className={ic} placeholder={`היי! אני מעוניין/ת לשמוע על ${editName} 🏺`} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveEdit(e.id)} disabled={saving}
                  className="flex-1 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1 transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} שמור
                </button>
                <button onClick={() => setEditingId(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium rounded-xl text-sm transition-colors">
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
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                  {e.active ? "פעיל" : "מוסתר"}
                </button>
                <button onClick={() => startEdit(e)} className="text-amber-500 hover:text-amber-700">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => remove(e.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="bg-white rounded-2xl p-5 border border-stone-100 flex flex-col gap-3">
        <h3 className="font-bold text-stone-800">הוספת אירוע</h3>
        <input placeholder="שם האירוע" value={name} onChange={(e) => setName(e.target.value)} className={ic} />
        <textarea placeholder="תיאור" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} className={ic + " resize-none"} />
        <div>
          <label className="block text-xs text-stone-500 mb-1">תמונה (אופציונלי)</label>
          <ImageUploadField value={img} onChange={setImg} placeholder="URL תמונה (אופציונלי)" />
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" className="mt-2 h-20 rounded-xl object-cover border border-stone-200" />
          )}
        </div>
        <button onClick={add} disabled={loading} className="py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} הוסף אירוע
        </button>
      </div>
    </div>
  );
}

// --- גלריה ---
function GalleryTab({ initGallery }: { initGallery: GalleryImage[] }) {
  const [gallery, setGallery] = useState(initGallery);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  async function add() {
    if (!url) return;
    setLoading(true);
    const res = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, caption: caption || null, order: gallery.length }),
    });
    const img = await res.json();
    setGallery([...gallery, img]);
    setUrl(""); setCaption("");
    setLoading(false);
  }

  async function remove(id: string) {
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    setGallery(gallery.filter((g) => g.id !== id));
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="grid grid-cols-3 gap-3">
        {gallery.map((img) => (
          <div key={img.id} className="relative group rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.caption || ""} className="w-full h-24 object-cover" />
            <button onClick={() => remove(img.id)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Trash2 className="w-5 h-5 text-white" />
            </button>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-5 border border-stone-100 flex flex-col gap-3">
        <h3 className="font-bold text-stone-800">הוספת תמונה</h3>
        <ImageUploadField value={url} onChange={setUrl} placeholder="URL תמונה" />
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-24 rounded-xl object-cover border border-stone-200 w-full" />
        )}
        <input placeholder="כיתוב (אופציונלי)" value={caption} onChange={(e) => setCaption(e.target.value)} className={ic} />
        <button onClick={add} disabled={loading || !url} className="py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} הוסף תמונה
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
          <button onClick={() => remove(r.id)} className="text-red-400 hover:text-red-600 flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <div className="bg-white rounded-2xl p-5 border border-stone-100 flex flex-col gap-3">
        <h3 className="font-bold text-stone-800">הוספת ביקורת</h3>
        <input placeholder="שם הלקוח/ה" value={newName} onChange={(e) => setNewName(e.target.value)} className={ic} />
        <textarea placeholder="תוכן הביקורת" rows={3} value={newContent} onChange={(e) => setNewContent(e.target.value)} className={ic + " resize-none"} />
        <div className="flex items-center gap-3">
          <label className="text-sm text-stone-600">דירוג:</label>
          {[1,2,3,4,5].map((n) => (
            <button key={n} type="button" onClick={() => setNewRating(n)}
              className={`text-xl transition-colors ${n <= newRating ? "text-amber-400" : "text-stone-200"}`}>
              ★
            </button>
          ))}
        </div>
        <button onClick={add} disabled={loading} className="py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} הוסף ביקורת
        </button>
      </div>
    </div>
  );
}

// --- תקנון ---
const DEFAULT_TERMS = `**1. כללי**
אתר זה מופעל על ידי סטודיו קדרות. השימוש באתר ובשירותיו מהווה הסכמה לתנאים המפורטים להלן.

**2. הרשמה לסדנאות**
ההרשמה לסדנאות מתבצעת באמצעות האתר בלבד. מקום בסדנה יישמר רק לאחר השלמת התשלום המלא.

**3. תשלומים**
כל התשלומים מתבצעים באמצעות Stripe. המחירים בשקלים חדשים (₪) וכוללים מע"מ.

**4. ביטולים והחזרים**
• ביטול עד 48 שעות לפני — החזר מלא.
• ביטול פחות מ-48 שעות — ללא החזר.
• ביטול מצד הסטודיו — החזר מלא תוך 5 ימי עסקים.

**5. קניין רוחני**
כל התמונות והתכנים באתר שייכים לסטודיו קדרות.

**6. פרטיות**
נשמרים שם מלא וכתובת מייל בלבד, לצורך אישור ההזמנה.

**7. יצירת קשר**
לשאלות בנוגע לתקנון — דרך עמוד צרו קשר.`;

function TermsTab({ content }: { content: Record<string, string> }) {
  const [text, setText] = useState(content["terms_content"] || DEFAULT_TERMS);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terms_content: text }),
    });
    setSaving(false);
    setMsg(res.ok ? "✅ נשמר!" : "❌ שגיאה");
    setTimeout(() => setMsg(""), 2000);
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-4 max-w-2xl">
      <div>
        <p className="text-sm text-stone-500 mb-1">עצבו את תוכן התקנון. השתמשו ב-<code className="bg-stone-100 px-1 rounded">**כותרת**</code> לכותרות סעיפים ושורה ריקה בין פסקאות.</p>
        <a href="/terms" target="_blank" className="text-xs text-amber-600 hover:underline">צפייה בתקנון ←</a>
      </div>
      <textarea
        rows={20}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={ic + " resize-y font-mono text-xs leading-relaxed"}
        dir="rtl"
      />
      {msg && <p className="text-sm">{msg}</p>}
      <button onClick={save} disabled={saving}
        className="py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />} שמירה
      </button>
    </div>
  );
}

// --- רקעים ---
function BackgroundsTab({ content }: { content: Record<string, string> }) {
  const pages = [
    { key: "bg_home", imgKey: "bg_image_home", label: "דף בית" },
    { key: "bg_workshops", imgKey: "bg_image_workshops", label: "סדנאות" },
    { key: "bg_events", imgKey: "bg_image_events", label: "אירועים מיוחדים" },
    { key: "bg_faq", imgKey: "bg_image_faq", label: "שאלות נפוצות" },
    { key: "bg_contact", imgKey: "bg_image_contact", label: "צרו קשר ומידע" },
  ];

  const allKeys = ["global_bg_color", ...pages.flatMap((p) => [p.key, p.imgKey])];
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(allKeys.map((k) => [k, content[k] || (k.startsWith("bg_image") ? "" : "#fdf8f0")]))
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function set(key: string, val: string) { setValues((v) => ({ ...v, [key]: val })); }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    setMsg(res.ok ? "✅ נשמר!" : "❌ שגיאה");
    setTimeout(() => setMsg(""), 2000);
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-6 max-w-2xl">
      <p className="text-sm text-stone-500">צבע רקע או תמונת רקע לכל דף. אם תמונה מוגדרת — היא תנצח על הצבע.</p>

      {/* Global color */}
      <div className="bg-amber-50 rounded-xl p-4 flex flex-col gap-2 border border-amber-200">
        <p className="text-sm font-bold text-amber-900">🎨 צבע כללי לכל הדפים</p>
        <p className="text-xs text-stone-500">דפים שלא הוגדר להם צבע ספציפי ישתמשו בצבע הזה</p>
        <div className="flex items-center gap-3 mt-1">
          <input
            type="color"
            value={values["global_bg_color"]}
            onChange={(e) => set("global_bg_color", e.target.value)}
            className="w-10 h-10 rounded-lg border border-stone-200 cursor-pointer p-0.5 bg-white"
          />
          <span className="text-xs text-stone-400 font-mono">{values["global_bg_color"]}</span>
          <button type="button" onClick={() => set("global_bg_color", "#fdf8f0")} className="text-xs text-stone-400 hover:text-stone-600 underline">איפוס</button>
        </div>
      </div>

      {pages.map((p) => (
        <div key={p.key} className="flex flex-col gap-2 pb-4 border-b border-stone-100 last:border-0">
          <p className="text-sm font-semibold text-stone-700">{p.label}</p>
          <div className="flex items-center gap-3">
            <label className="text-xs text-stone-500 w-20">צבע רקע</label>
            <input
              type="color"
              value={values[p.key]}
              onChange={(e) => set(p.key, e.target.value)}
              className="w-9 h-9 rounded-lg border border-stone-200 cursor-pointer p-0.5 bg-white"
            />
            <span className="text-xs text-stone-400 font-mono">{values[p.key]}</span>
          </div>
          <div className="flex items-start gap-3">
            <label className="text-xs text-stone-500 w-20 pt-2.5">תמונת רקע</label>
            <ImageUploadField value={values[p.imgKey]} onChange={(url) => set(p.imgKey, url)} />
          </div>
          {values[p.imgKey] && (
            <div className="h-16 rounded-xl overflow-hidden border border-stone-200 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={values[p.imgKey]} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      ))}
      {msg && <p className="text-sm">{msg}</p>}
      <button onClick={save} disabled={saving}
        className="py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />} שמירה
      </button>
    </div>
  );
}

const ic = "w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm";
