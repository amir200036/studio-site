import { defineConfig } from "prisma/config";
import "dotenv/config";

// משמש רק לפקודות CLI (db push, migrate, studio)
// ה-PrismaClient בקוד משתמש ב-adapter ב-src/lib/prisma.ts
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || "",
  },
});
