import type { Metadata } from "next";
import { Assistant, Secular_One } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  variable: "--font-assistant",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const secularOne = Secular_One({
  subsets: ["hebrew", "latin"],
  variable: "--font-secular",
  weight: "400",
});

export const metadata: Metadata = {
  title: "סטודיו קדרות | יצירה מהלב",
  description: "סטודיו קדרות ייחודי המציע סדנאות יצירה, אירועים מיוחדים וחוויות קדרות בלתי נשכחות",
  keywords: "קדרות, סדנאות, יצירה, חמר, עיצוב קרמי",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${assistant.variable} ${secularOne.variable} font-sans antialiased bg-stone-50 text-stone-800`}>
        <div className="overflow-x-hidden">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
