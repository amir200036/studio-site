import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// .env.development.local (מסד הפיתוח המקומי) גובר על .env.local (פרודקשן מ-vercel env pull).
// dotenv לא דורס משתנה שכבר נטען, ולכן הקובץ הראשון מנצח.
dotenv.config({ path: ".env.development.local" });
dotenv.config({ path: ".env.local" });
dotenv.config();

// משמש רק לפקודות CLI (db push, migrate, studio)
// ה-PrismaClient בקוד משתמש ב-adapter ב-src/lib/prisma.ts
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || "",
  },
});
