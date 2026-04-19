# 🏺 סטודיו קדרות — אתר מקצועי

אתר מלא לסטודיו קדרות עם מערכת הרשמה, תשלומים ופאנל ניהול.

## טכנולוגיות

| טכנולוגיה | שימוש |
|-----------|-------|
| Next.js 14 (App Router) | פריימוורק ראשי |
| TypeScript | שפת תכנות |
| Tailwind CSS | עיצוב |
| Prisma 7 + Vercel Postgres | מסד נתונים |
| NextAuth.js | אימות אדמין |
| Stripe | תשלומים |
| Resend | שליחת מיילים |
| Vercel | דיפלוי |

---

## הפעלה מקומית

### 1. התקנת תלויות

```bash
npm install
```

### 2. הגדרת משתני סביבה

```bash
cp .env.example .env
```

ערכו את `.env` עם הערכים שלכם (ראו `.env.example` לכל המשתנים).

### 3. יצירת טבלאות ב-DB

```bash
npm run db:push
```

### 4. הכנסת נתוני דמה

```bash
npm run db:seed
```

### 5. הפעלת שרת פיתוח

```bash
npm run dev
```

- אתר: `http://localhost:3000`
- פאנל ניהול: `http://localhost:3000/admin`

---

## מבנה הדפים

| נתיב | תוכן |
|------|------|
| `/` | דף בית (Hero, על הסטודיו, גלריה, ביקורות) |
| `/workshops` | רשימת סדנאות + הרשמה עם Stripe |
| `/events` | אירועים מיוחדים (פנייה דרך WhatsApp) |
| `/faq` | שאלות ותשובות |
| `/contact` | צרו קשר + מפה |
| `/info` | מידע מלא והגעה |
| `/admin` | לוח בקרה |
| `/admin/workshops` | ניהול סדנאות |
| `/admin/bookings` | כל ההזמנות |
| `/admin/customers` | ניהול לקוחות + ניוזלטר |
| `/admin/content` | עריכת תוכן, גלריה, ביקורות, FAQ, אירועים |
| `/admin/settings` | הגדרות כלליות |

---

## הגדרת Stripe

### פיתוח מקומי
```bash
# במסוף נפרד
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# העתיקו את ה-STRIPE_WEBHOOK_SECRET ל-.env
```

### פרודקשן
1. Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://yourdomain.com/api/webhooks/stripe`
3. Events: `checkout.session.completed`

---

## הגדרת Resend

1. [resend.com](https://resend.com) → צרו חשבון
2. הוסיפו ואמתו דומיין
3. צרו API Key → הכניסו ל-`RESEND_API_KEY`
4. עדכנו `RESEND_FROM` עם כתובת מאותו דומיין

**מצב פיתוח:** ללא RESEND_API_KEY — מיילים מודפסים ל-console (לא נשלחים).

---

## דיפלוי ל-Vercel

```bash
# 1. דחיפה ל-GitHub
git init && git add . && git commit -m "initial" && git push

# 2. ב-Vercel: Import repository
# 3. Storage → Create Postgres Database → Connect to project
# 4. הוסיפו Variables ידנית: NEXTAUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD,
#    STRIPE_*, RESEND_*, NEXT_PUBLIC_WHATSAPP_NUMBER

# 5. אחרי deploy ראשון — דחיפת schema:
npx vercel env pull .env.production.local
# ואז:
npm run db:push
npm run db:seed  # אופציונלי
```

---

## Rate Limiting

| מסלול | מגבלה |
|-------|-------|
| `/api/checkout` | 5 בקשות / דקה / IP |
| `/api/contact` | 3 בקשות / דקה / IP |

לפרודקשן בעומס גבוה — החליפו ב-Upstash Redis ב-`src/lib/rate-limit.ts`.

---

## מבנה הפרויקט

```
src/
├── app/
│   ├── page.tsx              # דף בית
│   ├── workshops/            # סדנאות + success
│   ├── events/               # אירועים
│   ├── faq/                  # שאלות נפוצות
│   ├── contact/              # צרו קשר
│   ├── info/                 # מידע
│   ├── admin/                # פאנל ניהול
│   └── api/                  # API routes
├── components/
│   ├── home/                 # HeroSection, AboutSection, גלריה, ביקורות
│   ├── workshops/            # WorkshopCard, BookingModal
│   ├── faq/                  # FAQAccordion
│   ├── contact/              # ContactForm
│   ├── layout/               # Navbar, Footer
│   └── admin/                # כל קומפוננטי הניהול
└── lib/
    ├── prisma.ts             # חיבור DB עם Pg adapter
    ├── auth.ts               # NextAuth credentials
    ├── email.ts              # Resend
    ├── rate-limit.ts         # Rate limiting
    └── utils.ts              # פונקציות עזר
```

---

## פקודות שימושיות

```bash
npm run dev          # שרת פיתוח
npm run build        # בניית פרודקשן
npm run db:push      # דחיפת schema ל-DB
npm run db:seed      # נתוני דמה
npm run db:studio    # Prisma Studio (ממשק ויזואלי ל-DB)
```
