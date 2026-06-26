"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { adminInputClass, adminPrimaryBtnClass } from "@/lib/admin-ui";

interface Props {
  settings: Record<string, string>;
}

const fields = [
  { key: "whatsapp", label: "מספר WhatsApp (עם קידומת מדינה)", placeholder: "972525771221", dir: "ltr" as const },
  { key: "email", label: "מייל הסטודיו", placeholder: "studio@example.com", dir: "ltr" as const },
  { key: "hours", label: "שעות פעילות", placeholder: "ראשון–חמישי: 09:00–18:00\nשישי: 09:00–13:00", textarea: true },
];

export function SettingsClient({ settings }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, settings[f.key] || ""]))
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
    setMsg(res.ok ? "✅ ההגדרות נשמרו!" : "❌ שגיאה");
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-5">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-medium text-stone-700 mb-1">{f.label}</label>
          {f.textarea ? (
            <textarea
              rows={3}
              value={values[f.key]}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className={adminInputClass + " resize-none"}
            />
          ) : (
            <input
              type="text"
              value={values[f.key]}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className={adminInputClass}
              dir={f.dir}
            />
          )}
        </div>
      ))}

      {msg && <p className="text-sm">{msg}</p>}

      <button
        onClick={save}
        disabled={saving}
        className={adminPrimaryBtnClass + " w-full sm:w-auto mt-2"}
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saving ? "שומר..." : "שמירת הגדרות"}
      </button>
    </div>
  );
}
