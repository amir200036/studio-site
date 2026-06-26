"use client";

import { useMemo, useRef } from "react";
import {
  applyWorkshopWhatsAppTemplate,
  buildDefaultWorkshopInquiryMessage,
} from "@/lib/workshop-whatsapp";
import { adminInputClass } from "@/lib/admin-ui";

const INSERT_FIELDS: { label: string; token: string }[] = [
  { label: "שם הסדנה", token: "{{workshopName}}" },
  { label: "שם הלקוח", token: "{{customerName}}" },
  { label: "מספר מקומות", token: "{{seats}}" },
  { label: "מחיר לאדם", token: "{{pricePerPerson}}" },
  { label: "סכום משוער", token: "{{total}}" },
  { label: "משך (שעות)", token: "{{durationHours}}" },
];

const SAMPLE = {
  workshopName: "סדנת יסודות הקדרות",
  durationHours: 3,
  pricePerPerson: 180,
  seats: 2,
  total: 360,
  customerName: "ישראל ישראלי",
};

interface Props {
  value: string;
  onChange: (value: string) => void;
  workshopName: string;
  durationHours: number;
  pricePerPerson: number;
}

export function WorkshopWhatsAppEditor({
  value,
  onChange,
  workshopName,
  durationHours,
  pricePerPerson,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertToken(token: string) {
    const el = textareaRef.current;
    if (!el) {
      onChange(value + token);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + token + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function resetToDefault() {
    onChange("");
  }

  const preview = useMemo(() => {
    const params = {
      workshopName: workshopName.trim() || SAMPLE.workshopName,
      durationHours: durationHours > 0 ? durationHours : SAMPLE.durationHours,
      pricePerPerson: pricePerPerson > 0 ? pricePerPerson : SAMPLE.pricePerPerson,
      seats: SAMPLE.seats,
      total: (pricePerPerson > 0 ? pricePerPerson : SAMPLE.pricePerPerson) * SAMPLE.seats,
      customerName: SAMPLE.customerName,
    };
    const trimmed = value.trim();
    if (!trimmed) return buildDefaultWorkshopInquiryMessage(params);
    return applyWorkshopWhatsAppTemplate(trimmed, params);
  }, [value, workshopName, durationHours, pricePerPerson]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-stone-500 leading-relaxed">
        ההודעה שתיפתח ללקוח/ה ב-WhatsApp אחרי מילוי הטופס. השאירו ריק לברירת המחדל של האתר.
      </p>

      <div className="flex flex-wrap gap-2">
        {INSERT_FIELDS.map((f) => (
          <button
            key={f.token}
            type="button"
            onClick={() => insertToken(f.token)}
            className="text-sm px-3 py-2 min-h-10 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl transition-colors"
          >
            + {f.label}
          </button>
        ))}
        <button
          type="button"
          onClick={resetToDefault}
          className="text-sm px-3 py-2 min-h-10 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-colors"
        >
          ברירת מחדל
        </button>
      </div>

      <textarea
        ref={textareaRef}
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={adminInputClass + " resize-y text-base leading-relaxed"}
        placeholder={`לדוגמה:\nשלום! אשמח להירשם ל{{workshopName}}\nשם: {{customerName}}\nמקומות: {{seats}}\nסכום משוער: {{total}}`}
        dir="rtl"
      />

      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
        <p className="text-xs font-semibold text-stone-500 mb-2">תצוגה מקדימה (דוגמה)</p>
        <p className="text-sm text-stone-700 whitespace-pre-line leading-relaxed">{preview}</p>
      </div>
    </div>
  );
}
