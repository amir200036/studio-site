"use client";

import { useState } from "react";
import type { FAQ } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  faqs: FAQ[];
}

export function FAQAccordion({ faqs }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="w-full flex items-center justify-between px-6 py-4 text-right hover:bg-amber-50 transition-colors"
            >
              <span className="font-semibold text-stone-800 text-base">{faq.question}</span>
              <ChevronDown
                className={cn("w-5 h-5 text-amber-600 transition-transform flex-shrink-0 mr-4", isOpen && "rotate-180")}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isOpen ? "max-h-96" : "max-h-0"
              )}
            >
              <div className="px-6 pb-4 text-stone-600 leading-relaxed border-t border-stone-50 pt-3">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
