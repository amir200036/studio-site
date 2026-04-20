"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "דף בית" },
  { href: "/workshops", label: "סדנאות" },
  { href: "/events", label: "אירועים" },
  { href: "/faq", label: "שאלות נפוצות" },
  { href: "/contact", label: "צרו קשר" },
];

export function Navbar({ bgColor }: { bgColor?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur border-b border-stone-200 shadow-sm"
      style={{ backgroundColor: bgColor ? `${bgColor}f2` : "#fdf8f0f2" }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* לוגו */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl text-amber-800 group-hover:text-amber-700 transition-colors" style={{ fontFamily: "var(--font-rubik)", fontWeight: 800 }}>
            סטודיו לקדרות וקרמיקה
          </span>
        </Link>

        {/* ניווט דסקטופ */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-lg text-stone-600 hover:text-amber-800 hover:bg-amber-50 transition-colors text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* המבורגר מובייל */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-amber-50 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="תפריט"
        >
          {open ? <X className="w-5 h-5 text-stone-600" /> : <Menu className="w-5 h-5 text-stone-600" />}
        </button>
      </div>

      {/* תפריט מובייל */}
      <div className={cn("md:hidden overflow-hidden transition-all duration-300", open ? "max-h-96" : "max-h-0")}>
        <nav className="px-4 pb-4 flex flex-col gap-1 border-t border-stone-100">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 rounded-lg text-stone-600 hover:text-amber-800 hover:bg-amber-50 transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
