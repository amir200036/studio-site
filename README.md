# יד יוצרת — סדנת קדרות בנס ציונה

אתר הזמנות לסטודיו קדרות — עברית RTL, מבוסס Next.js 14.

**כתובת האתר:** https://studio-site-one-hazel.vercel.app

---

## 1. סקירה כללית

**יד יוצרת** הוא אתר מלא לסטודיו קדרות בנס ציונה. האתר מאפשר ללקוחות לגלות סדנאות, להירשם ולשלם אונליין — ולאדמין לנהל הכל מפאנל ייעודי.

### טכנולוגיות

| שכבה | טכנולוגיה |
|---|---|
| Framework | Next.js 14 (App Router) |
| שפה | TypeScript |
| עיצוב | Tailwind CSS v3 + PostCSS + autoprefixer |
| מסד נתונים | Prisma 7 + Vercel Postgres |
| אימות | NextAuth.js v4 (Credentials + JWT) |
| תשלומים | Stripe (Checkout Sessions + Webhooks) |
| מיילים | Resend API |
| אחסון תמונות | Vercel Blob (פיתוח: `public/uploads/`) |
| אנליטיקה | Vercel Analytics |
| אייקונים | Lucide React |
| פונטים | Google Fonts — Assistant + Rubik (עברית + לטינית) |
| טפסים | react-hook-form + zod |

---

## 2. מבנה תיקיות

```
studio-site/
├── prisma/
│   ├── schema.prisma          # מודלי מסד הנתונים (PostgreSQL)
│   └── seed.ts                # נתוני דוגמה לפיתוח
├── prisma.config.ts           # הגדרת חיבור DB לפקודות CLI בלבד (Prisma 7)
├── public/
│   ├── llms.txt               # מפת תוכן לסוכני AI (ChatGPT, Claude, Perplexity)
│   └── robots.txt             # הרשאות סריקה לבוטים + מיקום sitemap
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout: HTML lang="he", RTL, פונטים, JSON-LD, Analytics
│   │   ├── globals.css        # הגדרות Tailwind בלבד
│   │   ├── sitemap.ts         # Sitemap דינמי (דפים + סדנאות + אירועים)
│   │   ├── error.tsx          # דף שגיאה גלובלי
│   │   ├── not-found.tsx      # דף 404
│   │   ├── (site)/            # קבוצת נתיב — דפים ציבוריים (URL ללא "(site)")
│   │   │   ├── layout.tsx     # Navbar + Footer + קריאת צבע רקע גלובלי מ-DB
│   │   │   ├── page.tsx       # דף הבית + JSON-LD AggregateRating דינמי
│   │   │   ├── workshops/     # רשימת סדנאות + /success לאחר תשלום
│   │   │   ├── events/        # אירועים מיוחדים (next/Image, כפתור WhatsApp)
│   │   │   ├── faq/           # שאלות נפוצות + JSON-LD FAQPage דינמי
│   │   │   ├── contact/       # יצירת קשר + מפה + פרטי סטודיו
│   │   │   ├── info/          # redirect → /contact
│   │   │   └── terms/         # תנאי שימוש מ-DB (עם ברירת מחדל)
│   │   ├── admin/             # פאנל אדמין — נפרד לחלוטין מ-(site)
│   │   │   ├── layout.tsx     # AdminNavbar רק כשיש session
│   │   │   ├── login/         # דף התחברות
│   │   │   ├── page.tsx       # לוח בקרה: KPIs + סדנאות + הזמנות
│   │   │   ├── stats/         # סטטיסטיקות: גרף 14 יום, 5 מובילים, KPIs
│   │   │   ├── workshops/     # ניהול סדנאות (רשימה / חדשה / עריכה)
│   │   │   ├── bookings/      # טבלת כל ההזמנות (כל הסטטוסים)
│   │   │   ├── customers/     # רשימת לקוחות + מייל + ניוזלטר
│   │   │   ├── content/       # עורך תוכן 7 לשוניות
│   │   │   └── settings/      # טלפון, שעות, embed מפה
│   │   └── api/
│   │       ├── auth/          # NextAuth handler
│   │       ├── checkout/      # יצירת Stripe Checkout Session
│   │       ├── contact/       # שליחת מייל מטופס קשר
│   │       ├── webhooks/stripe/ # Stripe Webhook → יצירת Booking
│   │       └── admin/         # כל ה-APIs המוגנים של האדמין
│   ├── components/
│   │   ├── layout/            # Navbar.tsx, Footer.tsx
│   │   ├── home/              # HeroSection, AboutSection, GallerySection,
│   │   │                      # ReviewsSection, WorkshopsPreview
│   │   ├── workshops/         # WorkshopCard.tsx, BookingModal.tsx
│   │   ├── faq/               # FAQAccordion.tsx
│   │   ├── contact/           # ContactForm.tsx
│   │   └── admin/             # AdminNavbar, ContentClient, CustomersClient,
│   │                          # ImageUploadField, LoginForm, SettingsClient,
│   │                          # WorkshopBookings, WorkshopForm
│   ├── lib/
│   │   ├── auth.ts            # הגדרות NextAuth
│   │   ├── prisma.ts          # Prisma singleton עם PrismaPg adapter
│   │   ├── email.ts           # פונקציות מייל דרך Resend API
│   │   ├── rate-limit.ts      # Rate limiter בזיכרון
│   │   └── utils.ts           # cn, formatPrice, formatDate/Time, buildWhatsAppUrl,
│   │                          # pageBackground, getAvailableSeats
│   └── middleware.ts          # הגנת /admin/* עם NextAuth withAuth
```

---

## 3. דפי האתר

### דפים ציבוריים

| נתיב | קובץ | תיאור |
|---|---|---|
| `/` | `(site)/page.tsx` | דף הבית — Hero, אודות, תצוגת סדנאות, גלריה, ביקורות |
| `/workshops` | `(site)/workshops/page.tsx` | רשימת סדנאות פעילות עם הרשמה ותשלום |
| `/workshops/success` | `(site)/workshops/success/page.tsx` | אישור הרשמה לאחר תשלום |
| `/events` | `(site)/events/page.tsx` | אירועים מיוחדים עם כפתור WhatsApp |
| `/faq` | `(site)/faq/page.tsx` | שאלות נפוצות עם JSON-LD FAQPage |
| `/contact` | `(site)/contact/page.tsx` | פרטי קשר, טופס ומפה |
| `/terms` | `(site)/terms/page.tsx` | תקנון האתר (מ-DB, עם ברירת מחדל) |
| `/info` | `(site)/info/page.tsx` | redirect → `/contact` |

### פאנל אדמין

| נתיב | קובץ | תיאור |
|---|---|---|
| `/admin/login` | `admin/login/page.tsx` | התחברות לפאנל |
| `/admin` | `admin/page.tsx` | לוח בקרה: KPIs, סדנאות קרובות, הזמנות אחרונות |
| `/admin/stats` | `admin/stats/page.tsx` | גרף 14 יום, 5 סדנאות מובילות, KPIs לפי תקופה |
| `/admin/workshops` | `admin/workshops/page.tsx` | רשימת כל הסדנאות |
| `/admin/workshops/new` | `admin/workshops/new/page.tsx` | יצירת סדנה חדשה |
| `/admin/workshops/[id]` | `admin/workshops/[id]/page.tsx` | עריכה + הזמנות + ביטול + מייל למשתתפים |
| `/admin/bookings` | `admin/bookings/page.tsx` | טבלת כל ההזמנות |
| `/admin/customers` | `admin/customers/page.tsx` | רשימת לקוחות, מייל אישי, ניוזלטר |
| `/admin/content` | `admin/content/page.tsx` | עורך תוכן: Hero, FAQ, אירועים, גלריה, ביקורות, תנאים, רקעים |
| `/admin/settings` | `admin/settings/page.tsx` | טלפון, מייל, כתובת, שעות, embed מפה |

---

## 4. פאנל אדמין

### כניסה

```
URL:   http://localhost:3000/admin/login
מייל:  ערך ADMIN_EMAIL מ-.env
סיסמה: ערך ADMIN_PASSWORD מ-.env
```

הגנה: `src/middleware.ts` מגן על כל `/admin/*` (חוץ מ-`/admin/login`) עם `next-auth/middleware`.

### לשוניות עורך התוכן (`/admin/content`)

| לשונית | מה אפשר לערוך |
|---|---|
| Hero | כותרת, תת-כותרת, CTA, אודות, סטטיסטיקות |
| FAQ | הוספה ומחיקת שאלות ותשובות |
| אירועים | יצירה/עריכה/מחיקה + הודעת WhatsApp מותאמת לכל אירוע |
| גלריה | הוספה/מחיקה של תמונות (URL או העלאת קובץ) |
| ביקורות | הוספה ישירה (approved=true אוטומטי), מחיקה |
| תנאים | עורך טקסט חופשי; `**כותרת**` = heading בולד |
| רקעים | color picker + URL תמונה לכל אחד מ-6 דפים ציבוריים |

### העלאת תמונות

קומפוננט `ImageUploadField` מאפשר גם URL ידני וגם העלאת קובץ (jpg/png/webp, עד 5MB):
- בפרודקשן עם `BLOB_READ_WRITE_TOKEN`: Vercel Blob
- בפיתוח ללא token: שמירה ב-`public/uploads/`

---

## 5. מסד הנתונים

### מודלים

| מודל | שדות עיקריים | תיאור |
|---|---|---|
| `Workshop` | name, date, durationHours, pricePerPerson, maxParticipants, status, imageUrl | סדנה |
| `Booking` | workshopId, customerName, customerEmail, seats, totalAmount, stripeSessionId, paymentStatus, cancelledAt, refundId | הזמנה |
| `Review` | authorName, content, rating (1-5), approved | ביקורת לקוח |
| `FAQ` | question, answer, order | שאלה נפוצה |
| `Event` | name, description, imageUrl, whatsappMessage, active, order | אירוע מיוחד |
| `GalleryImage` | url, caption, order | תמונת גלריה |
| `SiteContent` | key (unique), value | תוכן עריך (key-value store) |
| `TimeBlock` | blockedAt, reason | חסימת זמן (קיים בסכמה, לא בשימוש) |

### קשרים
- `Workshop` 1 → N `Booking` (onDelete: Cascade)
- `SiteContent` — key-value store עצמאי ללא קשרי FK

### ערכי `paymentStatus`
`"paid"` | `"pending"` | `"refunded"` | `"cancelled"`

---

## 6. זרימות עבודה

### א. לקוח מזמין מקום בסדנה

```
1. גולש ל-/workshops
2. לוחץ "הרשמה לסדנה" → נפתח BookingModal
3. ממלא שם, מייל, מספר מקומות
4. לוחץ "לתשלום" → POST /api/checkout
5. השרת יוצר Stripe Checkout Session ומחזיר URL
6. הלקוח מועבר לדף Stripe
7. לאחר תשלום מוצלח → Stripe שולח Webhook ל-POST /api/webhooks/stripe
8. Webhook יוצר Booking (paymentStatus="paid") ושולח מיילים
9. הלקוח מועבר ל-/workshops/success
```

### ב. שליחת מייל אישור

```
1. Webhook מקבל checkout.session.completed
2. מחלץ נתוני לקוח וסדנה
3. יוצר Booking ב-DB
4. sendBookingConfirmation() → מייל ללקוח
5. sendAdminNotification() → מייל לאדמין
6. אם יצירת Booking נכשלת → auto-refund + sendWebhookFailureNotification() לאדמין
```

### ג. זרימת תשלום Stripe

```
  הלקוח           Next.js                 Stripe
     │                │                       │
     ├─ לחיצה ────────►                        │
     │           POST /api/checkout            │
     │           יצירת session ─────────────────►
     │◄─ redirect ────◄─── { url } ────────────┤
     │                │                        │
     ├─ תשלום ─────────────────────────────────►
     │                │                        │
     │                │◄─ Webhook ─────────────┤
     │                │ (checkout.session.completed)
     │                │ יצירת Booking
     │                │ שליחת מיילים
     ├◄─ /success ────┤                        │
```

### ד. אדמין מבטל הזמנה בודדת

```
1. גולש ל-/admin/workshops/[id]
2. לוחץ "ביטול הזמנה"
3. POST /api/admin/bookings/[id]/refund
4. בדיקות: paymentStatus==="paid", פחות מ-90 יום
5. stripe.refunds.create() עם payment_intent
6. עדכון Booking: paymentStatus="refunded", cancelledAt=now(), refundId=...
7. sendRefundNotification() → מייל ללקוח + מייל לאדמין
```

---

## 7. משתני סביבה

| משתנה | דרישה | תיאור |
|---|---|---|
| `NEXTAUTH_SECRET` | **חובה** | סוד JWT — אל תשאיר ריק! (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | חובה | `http://localhost:3000` בפיתוח |
| `ADMIN_EMAIL` | חובה | מייל כניסה לאדמין |
| `ADMIN_PASSWORD` | חובה | סיסמה (טקסט בפיתוח, bcrypt בפרודקשן) |
| `STRIPE_SECRET_KEY` | חובה | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | חובה | `whsec_...` מ-Stripe Dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | חובה | `pk_test_...` |
| `RESEND_API_KEY` | אופציונלי | ללא — מיילים מודפסים לקונסול |
| `RESEND_FROM` | אופציונלי | כתובת שולח מייל |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | אופציונלי | מספר ספרות בלבד, e.g. `972501234567` |
| `POSTGRES_URL` | חובה | Vercel Postgres (pooling) |
| `POSTGRES_PRISMA_URL` | חובה | Vercel Postgres לPrisma |
| `POSTGRES_URL_NON_POOLING` | חובה | חיבור ישיר (ל-migrations/seed) |
| `BLOB_READ_WRITE_TOKEN` | אופציונלי | Vercel Blob — ללא: `public/uploads/` |

לקבלת כל משתני הסביבה מ-Vercel:
```bash
vercel env pull .env.local
```

---

## 8. פקודות שימושיות

```bash
npm run dev          # הפעלת שרת פיתוח (פורט 3000)
npm run build        # בניית גרסת פרודקשן
npm run db:push      # סנכרון schema עם DB (דורש POSTGRES_URL ב-.env.local)
npm run db:seed      # העמסת נתוני דוגמה (4 סדנאות, 6 FAQs, 4 אירועים, 5 ביקורות)
npm run db:studio    # פתיחת Prisma Studio — ממשק ויזואלי למסד הנתונים
npx prisma generate  # יצירת Prisma client מחדש לאחר שינוי schema
vercel env pull      # משיכת משתני סביבה מ-Vercel ל-.env.local
stripe listen \
  --forward-to localhost:3000/api/webhooks/stripe
                     # העברת Stripe webhooks בפיתוח (חובה לבדיקת תשלומים)
```

---

## 9. קבצים חשובים

| קובץ | מיקום | תיאור |
|---|---|---|
| `llms.txt` | `public/llms.txt` | תיאור האתר לסוכני AI — **אסור למחוק** |
| `robots.txt` | `public/robots.txt` | הרשאות סריקה + כתובת sitemap |
| `sitemap.ts` | `src/app/sitemap.ts` | Sitemap דינמי — מתעדכן אוטומטית עם סדנאות ואירועים |
| `prisma.config.ts` | שורש הפרויקט | הגדרת DB לפקודות CLI בלבד (Prisma 7) |
| `CLAUDE.md` | `../CLAUDE.md` (מחוץ לגיט) | הוראות מפורטות לסוכן AI — **לא בגיט** |
| `next.config.mjs` | שורש הפרויקט | מאפשר next/Image מכל hostname + serverBodySizeLimit 8MB |
| `src/middleware.ts` | `src/middleware.ts` | הגנה על `/admin/*` עם NextAuth |
| `src/lib/prisma.ts` | `src/lib/prisma.ts` | Prisma singleton עם PrismaPg adapter |

---

## 10. דברים שצריך לדעת

### כללי Prisma 7 — חשוב

אסור לשים `url` בתוך `datasource db` ב-`schema.prisma`. Prisma 7 מפריד בין CLI לבין Runtime:

```
schema.prisma    → provider בלבד, ללא url
prisma.config.ts → URL ל-CLI בלבד (db push, seed, studio)
src/lib/prisma.ts → PrismaPg adapter ל-runtime
```

### NEXTAUTH_SECRET

**חובה למלא.** `NEXTAUTH_SECRET=""` גורם לכישלון שקט — כניסת אדמין לא תעבוד.

### Stripe Webhook בפיתוח

ללא הפקודה הבאה, תשלום test לא יוצר הזמנה ב-DB:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Rate Limiting

מנגנון in-memory — לא מתאים לפרודקשן עם מספר instances. יש להחליף ב-Upstash Redis ב-`src/lib/rate-limit.ts`.

### בעיות ידועות

- דפי `/workshops/[id]` ו-`/events/[id]` מופיעים ב-sitemap אבל הדפים לא קיימים → 404 לכל מי שינסה להיכנס ישירות
- `TimeBlock` קיים ב-schema אבל אין לו UI

### לא מומש — TODO

- ביטול הזמנה עצמית על-ידי לקוח
- מספר אדמינים
- תזכורות אוטומטיות לפני סדנה (cron)
- ייצוא CSV
- קודי קופון/הנחות
- קטגוריות/סינון לסדנאות
- בדיקות Playwright
