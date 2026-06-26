"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/admin", label: "לוח בקרה" },
  { href: "/admin/workshops", label: "סדנאות" },
  { href: "/admin/bookings", label: "הזמנות" },
  { href: "/admin/customers", label: "לקוחות" },
  { href: "/admin/content", label: "תוכן" },
  { href: "/admin/gallery", label: "ספריית תמונות" },
  { href: "/admin/settings", label: "הגדרות" },
  { href: "/admin/stats", label: "סטטיסטיקות" },
];

function isNavActive(path: string, href: string) {
  if (href === "/admin") return path === "/admin";
  return path === href || path.startsWith(href + "/");
}

export function AdminNavbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-amber-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="text-amber-300 font-bold text-sm whitespace-nowrap">🏺 ניהול</span>

        {/* Desktop nav — מל lg ומעלה; טאבלט ומובייל בתפריט המבורגר */}
        <div className="hidden lg:flex items-center gap-1 flex-1 mx-4 overflow-x-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
                isNavActive(path, l.href)
                  ? "bg-amber-700 text-white font-semibold"
                  : "text-amber-200 hover:bg-amber-800 hover:text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 text-amber-200 hover:text-white transition-colors text-sm flex-shrink-0"
            title="יציאה"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">יציאה</span>
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden min-h-11 min-w-11 flex items-center justify-center rounded-lg text-amber-200 hover:bg-amber-800 hover:text-white transition-colors"
            aria-expanded={open}
            aria-label="תפריט"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-amber-800 px-4 py-3 flex flex-col gap-1 border-t border-amber-700 max-h-[70vh] overflow-y-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isNavActive(path, l.href)
                  ? "bg-amber-700 text-white font-semibold"
                  : "text-amber-200 hover:bg-amber-700 hover:text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
