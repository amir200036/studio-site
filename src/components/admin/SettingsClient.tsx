"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { adminInputClass, adminPrimaryBtnClass } from "@/lib/admin-ui";

interface Props {
  settings: Record<string, string>;
}

export function SettingsClient({ settings }: Props) {
  const [hours, setHours] = useState(settings.hours || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours }),
    });
    setSaving(false);
    setMsg(res.ok ? "✅ ההגדרות נשמרו!" : "❌ שגיאה");
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-5">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">שעות פעילות</label>
        <textarea
          rows={3}
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder={"ראשון–חמישי: 09:00–18:00\nשישי: 09:00–13:00"}
          className={adminInputClass + " resize-none"}
        />
      </div>

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
