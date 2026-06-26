import type { Metadata } from "next";
import { Assistant, Rubik } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  variable: "--font-assistant",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  weight: ["800"],
});

const siteUrl = getSiteUrl().replace(/\/$/, "");

export const metadata: Metadata = {
  title: {
    default: "סדנת קדרות בנס ציונה | יד יוצרת — חוויה יצירתית לזוגות, משפחות וחברות",
    template: "%s | יד יוצרת — סדנת קדרות בנס ציונה",
  },
  description:
    "סדנאות קדרות וקרמיקה בנס ציונה לזוגות, משפחות, ימי הולדת וגיבוש חברה. מדריכים מנוסים, אווירה חמה ומזמינה. הזמינו מקום עכשיו!",
  keywords: "קדרות, סדנאות קדרות, קרמיקה, נס ציונה, יצירה, חמר, גיבוש, יום הולדת, סדנה",
  metadataBase: new URL(siteUrl),
  openGraph: {
    siteName: "יד יוצרת — סדנת קדרות",
    locale: "he_IL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${assistant.variable} ${rubik.variable} font-sans antialiased bg-stone-50 text-stone-800`}>
        <div className="overflow-x-hidden">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
