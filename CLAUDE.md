# סטודיו קדרות — Studio Site

אתר Hebrew RTL לסטודיו קדרות עם פאנל ניהול, הזמנות במסד נתונים והרשמת לקוחות לסדנאות דרך **WhatsApp** (ללא תשלום אונליין בזרימת הלקוח).

**Live site**: הגדר `NEXT_PUBLIC_SITE_URL`; ב-Vercel אפשר להשאיר ריק ולהסתמך על `VERCEL_URL`.  
**Brand name**: יד יוצרת

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 + PostCSS + autoprefixer |
| Database | Prisma 7 + PostgreSQL (Vercel Postgres, both dev and prod) |
| Auth | NextAuth.js v4 (Credentials provider, JWT strategy) + middleware.ts |
| Public checkout | אין — הרשמה לסדנה דרך WhatsApp מדף `/workshops/[id]` |
| Email | Resend API (via direct fetch, not resend npm package) |
| Image Upload | Vercel Blob (`@vercel/blob`) — prod; local `public/uploads/` fallback in dev |
| Analytics | `@vercel/analytics` (injected in root layout.tsx) |
| Icons | Lucide React |
| Fonts | Google Fonts — Assistant (Hebrew + Latin) + Rubik 800 for headings |
| Form handling | react-hook-form + @hookform/resolvers + zod |
| Utilities | clsx, tailwind-merge, bcryptjs, date-fns |
| Extra UI | @headlessui/react, @heroicons/react |

---

## Critical Prisma 7 Rules — DO NOT BREAK

Prisma 7 now uses **PostgreSQL** (not SQLite). Two separate mechanisms are required:

### 1. CLI operations (migrations, db push, seed) — `prisma.config.ts` (root)
```ts
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";
// ORDER MATTERS — dev DB first, then prod. dotenv never overrides an already-set var.
dotenv.config({ path: ".env.development.local" });
dotenv.config({ path: ".env.local" });
dotenv.config();
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || "",
  },
});
```

### 2. Runtime (app code) — `src/lib/prisma.ts`
```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { pgSslFor } from "@/lib/pg-ssl";
// NOT a hardcoded ssl object — that breaks the local dev server (see Local Dev Database)
const pool = new Pool({ connectionString, ssl: pgSslFor(connectionString) });
const adapter = new PrismaPg(pool);
return new PrismaClient({ adapter });
```

### schema.prisma — NO `url` field in datasource
```prisma
datasource db {
  provider = "postgresql"
  // NO url here — Prisma 7 requirement
}
```

### After any schema change:
```bash
npx prisma db push    # applies to the LOCAL studio_dev database only (see below)
npx prisma generate   # regenerates client types
```

---

## Local Dev Database — READ BEFORE RUNNING ANY DB COMMAND

**Dev and prod used to share one database.** `.env.local` is written by `vercel env pull` and holds the
**production** Supabase URL, so every local script hit the live site. `npm run db:seed` calls
`deleteMany()` on *every* table (`prisma/seed.ts`) — running it locally wiped all live content
(backgrounds, gallery, workshops, reviews). Its `NODE_ENV === "production"` guard never fires locally,
because `NODE_ENV` is undefined under tsx.

Dev now has its own database:

| | |
|---|---|
| Server | PostgreSQL 17 (Homebrew) — `brew services start postgresql@17` |
| Database | `studio_dev` on `localhost:5432` |
| Config | `.env.development.local` (gitignored via `.env*.local`) |
| CLI tools | `/opt/homebrew/opt/postgresql@17/bin` — not on PATH by default |

### Which database a command hits

`.env.development.local` takes precedence over `.env.local`, so **every local command targets `studio_dev`**:

| Context | Database |
|---|---|
| `next dev` | `studio_dev` — Next loads `.env.development.local` ahead of `.env.local` |
| `next build` / Vercel production | Supabase — Next **ignores** `.env.development.local` when `NODE_ENV=production`, and the file does not exist on Vercel |
| `prisma db push`, `db:seed`, `db:studio`, `scripts/upsert-terms.ts` | `studio_dev` — these load dotenv manually with `.env.development.local` listed first |

### Rules

- **Never** put `.env.local` ahead of `.env.development.local` in a dotenv call. That silently repoints
  every local script — including the destructive seed — at the live site.
- `vercel env pull` writes only `.env.local`. Never aim it at `.env.development.local`.
- Schema changes reach **dev only**. Applying one to production is a separate, deliberate step.
- To work against production on purpose:
  `mv .env.development.local .env.development.local.off` — and move it back when done.
- Deploys never write to the database or to Blob. Editing code cannot change site content;
  only DB commands and admin-panel actions can.

### SSL — `src/lib/pg-ssl.ts`

The local server runs with `ssl = off`; Supabase requires SSL. `pgSslFor(url)` returns `false` for
`localhost` / `127.0.0.1` / `::1`, and `{ rejectUnauthorized: false }` for everything else. Used by
`src/lib/prisma.ts`, `prisma/seed.ts`, `scripts/upsert-terms.ts`. **Do not hardcode `ssl:` in a
`new Pool()` again** — it fails locally with "The server does not support SSL connections".

---

## Project Structure

```
studio-site/
├── prisma/
│   ├── schema.prisma          # DB models (PostgreSQL)
│   └── seed.ts                # Sample data seeder
├── prisma.config.ts           # CLI datasource URL (Prisma 7) — reads .env.local then .env
├── public/
│   ├── llms.txt               # AI agent map (edit URLs if domain changes)
│   └── robots.txt             # Bot permissions + sitemap URL (edit Sitemap line in prod)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout — HTML, body, fonts, JSON-LD LocalBusiness, Vercel Analytics
│   │   ├── globals.css        # @tailwind directives only
│   │   ├── sitemap.ts         # Dynamic sitemap — static pages + visible public workshops
│   │   ├── error.tsx          # Global error boundary
│   │   ├── not-found.tsx      # 404 page
│   │   ├── (site)/            # Route group — PUBLIC pages
│   │   │   ├── layout.tsx     # Wraps with <Navbar> + <main> + <Footer>; reads global_bg_color from DB
│   │   │   ├── page.tsx       # Home page — JSON-LD AggregateRating (dynamic)
│   │   │   ├── workshops/     # Listing + `[id]` detail (WhatsApp) + `/success` → redirect to `/workshops`
│   │   │   │   ├── page.tsx   # WorkshopCard grid; visible public workshops only
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── success/page.tsx  # Legacy URL → redirect
│   │   │   ├── events/        # Special events — uses next/Image for event images
│   │   │   ├── faq/           # FAQ accordion — JSON-LD FAQPage schema (dynamic)
│   │   │   ├── contact/       # Contact form + studio info + hardcoded Google Maps embed
│   │   │   ├── info/          # Redirects → /contact
│   │   │   └── terms/         # Terms & conditions rendered from SiteContent DB key
│   │   ├── admin/             # ADMIN pages — completely separate from (site)
│   │   │   ├── layout.tsx     # Shows AdminNavbar only when session exists
│   │   │   ├── login/page.tsx # Login page
│   │   │   ├── page.tsx       # Dashboard: KPI cards, upcoming workshops, recent bookings
│   │   │   ├── stats/page.tsx # Detailed stats: 14-day chart, top workshops, KPIs
│   │   │   ├── workshops/     # Workshop management
│   │   │   │   ├── page.tsx   # List all workshops
│   │   │   │   ├── new/page.tsx # Create workshop form
│   │   │   │   └── [id]/page.tsx # Edit workshop + view/add bookings + email attendees
│   │   │   ├── bookings/page.tsx  # All bookings table (all statuses)
│   │   │   ├── customers/page.tsx # Customer list, individual email, newsletter
│   │   │   ├── content/page.tsx   # 6-tab content editor
│   │   │   └── settings/page.tsx  # Contact info, hours, map embed
│   │   └── api/
│   │       ├── auth/[...nextauth]/  # NextAuth handler
│   │       ├── contact/             # Contact form email (Resend)
│   │       └── admin/               # Protected admin APIs (see API Routes section)
│   ├── components/
│   │   ├── layout/            # Navbar.tsx, Footer.tsx
│   │   ├── home/              # HeroSection.tsx, AboutSection.tsx, GallerySection.tsx, ReviewsSection.tsx, WorkshopsPreview.tsx
│   │   ├── workshops/         # WorkshopCard.tsx, WorkshopWhatsAppForm.tsx
│   │   ├── faq/               # FAQAccordion.tsx
│   │   ├── contact/           # ContactForm.tsx
│   │   └── admin/             # AdminNavbar.tsx, ContentClient.tsx, CustomersClient.tsx, ImageUploadField.tsx, LoginForm.tsx, SettingsClient.tsx, WorkshopBookings.tsx, WorkshopForm.tsx
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Prisma singleton (PrismaPg / PostgreSQL adapter)
│   │   ├── email.ts           # Resend email functions (via direct fetch)
│   │   ├── rate-limit.ts      # In-memory rate limiter
│   │   ├── site-url.ts        # getSiteUrl() for canonical URLs
│   │   └── utils.ts           # cn(), formatPrice(), formatDate(), formatDateTime(), formatTime(), buildWhatsAppUrl(), pageBackground(), getAvailableSeats()
│   └── middleware.ts          # NextAuth withAuth — protects /admin/* routes
```

### Important: Route Groups
- `(site)/` = public pages. The parentheses are a Next.js route group — they do NOT appear in URLs
- `/admin` is completely separate — no Navbar/Footer from the public site
- Root `layout.tsx` renders only `{children}` (no Navbar/Footer)

---

## Database Schema

The database is **PostgreSQL** (Vercel Postgres). The schema uses no `url` field in `datasource db`.

```prisma
model Workshop {
  id              String    @id @default(cuid())
  name            String
  date            DateTime?   // אופציונלי — המועד מתואם ב-WhatsApp
  durationHours   Float
  description     String
  imageUrl        String?
  pricePerPerson  Float
  maxParticipants Int
  status          String    @default("active")  // "active" | "blocked" | "cancelled"
  whatsappMessage String?   // תבנית הודעת WhatsApp; ריק = ברירת מחדל
  bookings        Booking[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Booking {
  id              String    @id @default(cuid())
  workshopId      String
  workshop        Workshop  @relation(fields: [workshopId], references: [id], onDelete: Cascade)
  customerName    String
  customerEmail   String
  seats           Int
  totalAmount     Float
  paymentStatus   String    @default("paid")  // "paid" | "pending" | "refunded" | "cancelled"
  cancelledAt     DateTime? // set when status becomes refunded/cancelled
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Review { ... }
model FAQ { ... }
model Event { ... }
model GalleryImage { ... }
model SiteContent { ... }
```

There is **no Stripe integration and no online payment** — registration happens over WhatsApp.
`Booking` therefore has no `stripeSessionId` and no `refundId`, and there is no `TimeBlock` model.
`GalleryImage` is the central media library: every upload creates a row, and workshop / event /
background images all reference `GalleryImage.url` values chosen through `GalleryImagePicker`.

### SiteContent keys in use:
| Key | Description |
|---|---|
| `hero_title` | Hero section title |
| `hero_subtitle` | Hero subtitle |
| `hero_cta` | Hero CTA button text |
| `about_title` | About section heading |
| `about_text` | About section body |
| `about_image` | About section image URL |
| `stat_years` | Years stat |
| `stat_students` | Students stat |
| `stat_workshops` | Workshops stat |
| `phone` | Studio phone |
| `email` | Studio email |
| `address` | Studio address |
| `hours` | Opening hours (multi-line) |
| `whatsapp` | WhatsApp number (digits only, e.g. 972501234567) |
| `map_embed` | Google Maps embed `src` URL |
| `terms_content` | Terms & conditions (markdown-like, **heading** format) |
| `global_bg_color` | Site-wide background color (hex) — applies to all pages via `(site)/layout.tsx` |
| `bg_image_home` | Home page Hero section background image URL |
| `bg_image_workshops` | Workshops page background image URL |
| `bg_image_events` | Events page background image URL |
| `bg_image_faq` | FAQ page background image URL |
| `bg_image_contact` | Contact page background image URL |

---

## Environment Variables

```env
# Canonical site URL (metadata, sitemap, JSON-LD, /robots, /llms.txt)
NEXT_PUBLIC_SITE_URL="https://your-domain.com"

# Auth
NEXTAUTH_SECRET="..."          # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="amir@gmail.com"
ADMIN_PASSWORD="amir123"       # Plain text for dev; bcrypt hash for prod

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM="סטודיו קדרות <noreply@studio.co.il>"

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER="972501234567"

# Vercel Postgres (auto-provided by Vercel; also pull locally with: vercel env pull)
POSTGRES_URL=""
POSTGRES_PRISMA_URL=""
POSTGRES_URL_NON_POOLING=""

# Vercel Blob (for image uploads in production)
BLOB_READ_WRITE_TOKEN=""       # Optional — falls back to local public/uploads/ in dev
```

**Critical**: `NEXTAUTH_SECRET` must not be empty — NextAuth will silently reject all logins with an empty secret.

To get the env vars locally: `vercel env pull .env.local` — this **overwrites** `.env.local`, which is why
the dev database URL lives in `.env.development.local` instead (see Local Dev Database):

```env
# .env.development.local — local dev DB, overrides .env.local, gitignored, untouched by vercel env pull
POSTGRES_PRISMA_URL="postgresql://amir@localhost:5432/studio_dev"
POSTGRES_URL="postgresql://amir@localhost:5432/studio_dev"
POSTGRES_URL_NON_POOLING="postgresql://amir@localhost:5432/studio_dev"
DATABASE_URL="postgresql://amir@localhost:5432/studio_dev"
```

---

## Admin Panel

**URL**: `http://localhost:3000/admin/login`  
**Default credentials**: `amir@gmail.com` / `amir123`

### Admin Pages:
Registration runs through WhatsApp, so the dashboard / bookings / customers pages were removed —
`/admin/bookings` and `/admin/customers` no longer exist at all. `/admin` still redirects.

| Route | Purpose |
|---|---|
| `/admin/login` | Login form |
| `/admin/workshops` | List all workshops — the admin landing page |
| `/admin/workshops/new` | Create workshop form |
| `/admin/workshops/[id]` | Edit workshop |
| `/admin/gallery` | Media library — upload and manage `GalleryImage` rows |
| `/admin/content` | 6-tab editor: Hero, FAQ, Events, Reviews, Backgrounds, Terms. The Hero / Backgrounds / Terms tabs use `StickySaveBar` (`src/components/admin/StickySaveBar.tsx`): the save button stays pinned to the viewport, shows whether there are unsaved changes, and warns before leaving the page with edits pending |
| — | `/admin/settings` was deleted; opening hours are a tab in `/admin/content` |
| `/admin/stats` | Content statistics — active workshops, seats, price range, rating, and a "what needs attention" checklist. Shows **no** registration or revenue figures: WhatsApp registration never creates a `Booking`, so there is nothing to count |
| `/admin` | **redirect → `/admin/workshops`** |

### Admin Content Tabs:
- **Hero** — hero title, subtitle, CTA, about section, stats
- **FAQ** — add/delete Q&A
- **Events** — create/edit/delete events. Each event has: name, description, image URL (with upload), custom WhatsApp message, active/hidden toggle
- **Gallery** — moved out of the tabs into its own page at `/admin/gallery`
- **Reviews** — admin fills reviews directly (approved=true automatically), delete
- **Terms** — free-text editor. Use `**Section Title**` for bold headings
- **Backgrounds** — global background colour, hero heading colour (`hero_text_color`), and a background image per public page
- **שעות פעילות** — opening hours shown on `/contact`; replaced the standalone `/admin/settings` page

### Admin Layout Logic:
```tsx
// admin/layout.tsx — no redirect, just conditional render
if (!session) return <>{children}</>  // login page renders without admin chrome
if (session) return <AdminNavbar> + <main>{children}</main>
```
The `(site)` Navbar/Footer never appears in `/admin/*` — they use separate layouts.

### Admin Route Protection:
`src/middleware.ts` uses `next-auth/middleware` `withAuth` to protect all `/admin/*` paths (except `/admin/login`).

### Image Upload:
`GalleryImagePicker` handles both URL input and file upload. The API route `/api/admin/upload` accepts
jpg/png/webp (max 8MB):
- With `BLOB_READ_WRITE_TOKEN` → uploads to Vercel Blob, returns public URL
- Without token **in dev** → saves to `public/uploads/`
- Without token **in production** → returns **503**, does not write. Vercel's filesystem is ephemeral, so a
  local write there would report success and then vanish on the next deploy. Fail loud instead.

### Image files & orphan cleanup — `src/lib/blob-cleanup.ts`
The file lives in Vercel Blob; the URL pointing at it lives in Postgres — `GalleryImage.url`,
`Workshop.imageUrl`, `Event.imageUrl`, and the `SiteContent` keys listed in `IMAGE_CONTENT_KEYS`
(`src/lib/site-content-keys.ts`). Losing the DB does not lose the files, but it does lose every reference
to them.

`deleteBlobIfUnreferenced(url)` deletes the Blob file **only when no row still references it**. The same
gallery image can be reused as a workshop image and a page background at the same time
(`GalleryImagePicker` is shared), so unconditional deletion breaks unrelated pages. If the reference
check itself fails, it deletes nothing — an orphaned file beats a missing image. Always call it *after*
the row is deleted or updated, so it does not count the row being changed.

Wired into: gallery DELETE, workshop DELETE + PATCH, event DELETE + PATCH, content POST
(background / about images).

`collectReplacedImageUrls(previous, next)` returns the deduplicated old URLs a `SiteContent` update
replaced, skipping keys absent from that update.

### Recovering orphaned images — `/api/admin/gallery/orphans`
Files can end up in Blob with nothing in the database pointing at them: the upload succeeds and the
follow-up insert fails, or the references are lost. `GET` lists every blob no row references; `POST`
imports selected URLs into `GalleryImage`. The import re-derives the orphan set server-side and only
accepts URLs that are genuinely unreferenced — it never trusts the list the browser posts back. The
UI lives at the top of `/admin/gallery` (`OrphanImageImport`) and hides itself when nothing is
orphaned. This exists because a production incident left 21 files stranded this way.

---

## Public Pages

All public pages use `export const dynamic = "force-dynamic"` — required for DB reads at request time.

### Metadata:
Every public page exports `Metadata` with `title`, `description`, `alternates.canonical`, and `openGraph`. The root layout sets the default `metadataBase` and global `metadata`.

### Page Backgrounds:
The global background color (`global_bg_color`) is applied by `(site)/layout.tsx` to the entire site wrapper.  
Each page can override with a per-page background **image** using `pageBackground(color, imageUrl)` from `src/lib/utils.ts`:
```ts
<div style={pageBackground("", content["bg_image_workshops"] || "")}>
```
If image URL is set → `backgroundImage: url(...)` with cover + fixed attachment.  
The home page background image applies only to the **Hero section** (not the whole page).  
`/info` page redirects to `/contact` — no background key needed.

### Layout adapts to whether an image exists
Image slots must never render a placeholder box. `WorkshopCard` shows the photo with the price as a
badge when one is set, and an accent stripe with the price beside the title when not; `AboutSection`
switches from a two-column grid to centred text plus a stats bar. With no photographs in the database
a placeholder is most of what a visitor sees, and it reads as broken rather than empty.

`WorkshopsPreview` renders `WorkshopCard` — it must not keep its own copy of the card markup, which
is how the home page and the workshops page silently drifted apart before.

### Root layout must not create a scroll container
`src/app/layout.tsx` renders `{children}` directly. Wrapping it in `overflow-x-hidden` (as it once
did) breaks `position: sticky` for every descendant on every page. The horizontal-overflow guard
lives on the public layout as `overflow-x-clip`, which does not create a scroll container.

### next/Image usage:
All `<img>` tags have been replaced with `next/Image`. Remote images are allowed from any hostname via `next.config.mjs`. Images use `fill` with a relative parent for cards, or explicit `width/height` for hero.

---

## API Routes

### Public:
- `POST /api/contact` — sends contact message via Resend to `ADMIN_EMAIL`. Rate limited: 3/min. Returns error if admin email missing or Resend send fails (dev: logs to console)

### Admin (all require active session):
- `POST /api/admin/workshops` — create workshop
- `PATCH /api/admin/workshops/[id]` — update workshop
- `DELETE /api/admin/workshops/[id]` — delete workshop + send cancellation emails to all paid attendees
- `POST /api/admin/workshops/[id]/add-booking` — manually add booking
- `POST /api/admin/workshops/[id]/email` — email all attendees
- `POST /api/admin/bookings/[id]/refund` — marks booking refunded / cancelled in DB (no Stripe in this flow)
- `POST /api/admin/content` — upsert any SiteContent key/value pairs
- `POST /api/admin/faqs` + `PATCH/DELETE /api/admin/faqs/[id]`
- `POST /api/admin/events` + `PATCH/DELETE /api/admin/events/[id]`
- `POST /api/admin/gallery` + `DELETE /api/admin/gallery/[id]`
- `POST /api/admin/reviews` — creates with `approved: true`
- `PATCH/DELETE /api/admin/reviews/[id]`
- `POST /api/admin/email` — send email to individual customer
- `POST /api/admin/email/newsletter` — send to all customers
- `POST /api/admin/upload` — upload image file → Vercel Blob (prod) or `public/uploads/` (dev)
- `GET /api/admin/export/bookings` + `GET /api/admin/export/customers` — CSV export (session required)

---

## Key Patterns

### Caching: ISR on public pages, dynamic on admin
Public pages, `sitemap.ts`, `robots.ts` and `/llms.txt` use `export const revalidate = 300` — they
are prerendered and served from the CDN. Admin pages keep `export const dynamic = "force-dynamic"`;
they must always reflect the current database.

Every admin route that writes calls `revalidateSite()` (`src/lib/revalidate-site.ts`) before
returning, so an edit appears on the site immediately instead of waiting out the 5 minutes. **If you
add a mutating admin route, add that call** — otherwise the change will look like it did not save.
Never call it from a GET handler.

Public queries go through `safeDbQuery`, so a database outage prerenders empty content rather than
crashing; ISR re-renders it once the database is back.

### Canonical site URL:
Use `getSiteUrl()` from `src/lib/site-url.ts` anywhere you need an absolute URL (metadata `alternates`, OpenGraph, sitemap, JSON-LD). Order: `NEXT_PUBLIC_SITE_URL` → `https://${VERCEL_URL}` → `http://localhost:3000`.

### TypeScript Set spread:
```ts
Array.from(new Set(...))   // NOT [...new Set(...)] — causes TS errors
Array.from(map.values())   // NOT [...map.values()]
```

### Tailwind dynamic classes:
Never construct class names dynamically (e.g. `bg-${color}-500`) — Tailwind won't include them in the build. Use full class strings.

---

## Email System (Resend)

Functions in `src/lib/email.ts` (uses direct fetch to Resend API, not the resend npm package):
- `sendBookingConfirmation(booking)` — to customer after payment
- `sendAdminNotification(booking)` — to admin on new booking
- `sendCancellationEmail(to, customerName, workshopName, workshopDate)` — to customer when workshop deleted
- `sendRefundNotification(info)` — to customer AND admin when individual booking is refunded
- `sendWebhookFailureNotification(info)` — to admin when Stripe webhook processing fails (with auto-refund info)
- `sendCustomEmail(to, subject, body)` — admin-triggered; returns `Promise<boolean>` (empty `to` or Resend failure → `false`; dev without key → `true` after console log)

Development: if `RESEND_API_KEY` is empty or `"re_..."`, emails log to console and `sendEmail` reports success for local flow.

---

## Rate Limiting

In-memory, suitable for single-instance deployment:
```ts
import { rateLimit, getClientIp } from "@/lib/rate-limit";
const ip = getClientIp(req);
const { allowed } = rateLimit(ip, "contact", { maxRequests: 3, windowMs: 60_000 });
if (!allowed) return NextResponse.json({ error: "יותר מדי בקשות" }, { status: 429 });
```

For production with multiple instances → replace with Upstash Redis.

---

## Development Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run db:push      # Apply schema changes — targets LOCAL studio_dev
npm run db:seed      # DESTRUCTIVE: deleteMany() on every table, then demo data — targets LOCAL studio_dev
npm run db:studio    # Prisma Studio (visual DB browser) — targets LOCAL studio_dev
npx prisma generate  # Regenerate client after schema changes
vercel env pull      # Pull Vercel env vars — OVERWRITES .env.local (never .env.development.local)

brew services start postgresql@17   # start the local dev database
brew services stop  postgresql@17   # stop it
```

---

## What's Missing / Not Implemented

1. **Individual booking cancellation by customer** — no self-service cancellation flow for customers (admin can mark refunded via `/api/admin/bookings/[id]/refund`)
2. **Workshop categories / filtering** — no tags or categories
3. **Discount codes** — no coupon/promo code support
4. **Mobile testing** — Playwright tests were discussed but not implemented
5. **Time-slot blocking** — no model or UI for blocking specific time slots
6. **Individual event detail pages** — `/events/[id]` route doesn't exist (events are listed on `/events` only)

---

## Known Issues Fixed in This Project

- **Prisma 7 + SQLite → PostgreSQL migration**: Full migration from SQLite + better-sqlite3 adapter to PostgreSQL + pg adapter. `prisma.config.ts` reads from `.env.local`
- **Tailwind not loading**: caused by `* { @apply border-stone-200; }` in globals.css — removed. Also requires autoprefixer in postcss.config.mjs
- **Admin login failure**: `NEXTAUTH_SECRET=""` (empty) causes silent JWT signing failures
- **Admin infinite redirect loop**: `admin/layout.tsx` was redirecting to `/admin/login` even when already on login page — fixed by rendering `{children}` when no session instead of redirecting
- **Public Navbar in admin**: Fixed by using `(site)/` route group — admin pages no longer inherit root layout's Navbar+Footer
- **next/Image conversion**: All `<img>` tags replaced with `next/Image` for performance. `next.config.mjs` allows all remote hostnames
- **Stripe removal**: online payment was dropped in favour of WhatsApp registration. `stripeSessionId` / `refundId` and the Stripe webhook are gone; `Booking` keeps only `cancelledAt`
- **Image upload**: Added `ImageUploadField` component + `/api/admin/upload` route supporting Vercel Blob in prod and local fallback in dev

---

## Seed Data

`npm run db:seed` is **destructive**: it runs `deleteMany()` on `booking`, `workshop`, `fAQ`, `event`,
`galleryImage`, `review` and `siteContent` before inserting demo data. It targets the local `studio_dev`
database (see Local Dev Database) — confirm that before running it, and never run it against production
without `ALLOW_DB_SEED=true` and a deliberate reason.

Populates:
- 4 workshops (date `null` — scheduled over WhatsApp)
- 6 FAQs
- 4 special events
- 5 approved reviews
- 10 SiteContent rows (hero, about, stats, hours, terms)

---

## Schema Markup (JSON-LD)

| Location | Type | Notes |
|---|---|---|
| `src/app/layout.tsx` | `LocalBusiness` + `ArtStudio` | Static — hardcoded address, geo, hours |
| `src/app/(site)/page.tsx` | `LocalBusiness` + `AggregateRating` | Dynamic — calculated from approved reviews; only rendered when reviews exist |
| `src/app/(site)/faq/page.tsx` | `FAQPage` | Dynamic — built from DB FAQs; only rendered when FAQs exist |

All schemas use `https://schema.org` context. No `Event` schema is currently rendered on the workshops page. Workshop detail URLs exist at `/workshops/[id]` and are included in the sitemap.

---

## GEO & AI Optimization

### קבצים שאסור למחוק או לשנות מבלי להבין למה
- `public/llms.txt` — מפת דרכים לסוכני AI (GPTBot, ClaudeBot, PerplexityBot וכו'); עדכנו קישורים אם הדומיין משתנה
- `public/robots.txt` — הרשאות לבוטי AI ומיקום sitemap; עדכנו שורת `Sitemap` בפרודקשן
- `src/app/sitemap.ts` — sitemap דינמי עם דפים סטטיים וסדנאות ציבוריות פעילות

### עקרונות GEO לכתיבת תוכן
1. **טרמינולוגיה כפולה** — שילוב מונחים בעברית ובאנגלית (למשל: "סדנת אובניים (Wheel Throwing)")
2. **תוכן מודולרי** — כל פסקה עומדת בפני עצמה ויכולה להיות מצוטטת
3. **תשובות באורך 40-60 מילים** — אופטימלי לציטוט
4. **הימנעות משפה שיווקית מוגזמת** — "הכי טוב ביקום" יורד בדירוג
5. **עדכניות** — תאריך עדכון אחרון בקבצים

### חוקי זהב
- אין לחסום בוטי AI ב-robots.txt
- כל שינוי בתוכן הדפים = שיקול בעדכון `public/llms.txt`
- שמות דפים, כתובות וטלפונים — חייבים להיות זהים בכל מקום (NAP consistency)
- סדנאות חדשות נכנסות אוטומטית ל-sitemap

### קהל יעד עיקרי לאופטימיזציה
- זוגות לתאריך
- חברות לאירועי גיבוש
- מתחילים מוחלטים
- משפחות עם ילדים מגיל 10
- מיקום: נס ציונה, מרכז הארץ

### שם הסטודיו
- שם המותג: יד יוצרת
- מילות חיפוש עיקריות: "סטודיו קדרות בנס ציונה", "סדנת קדרות לזוגות", "אירוע גיבוש יצירתי"
