import path from "path";
import { defineConfig } from "prisma/config";

// ה-url כאן משמש רק עבור פקודות CLI (db push, migrate)
// ה-PrismaClient בקוד משתמש ב-adapter ב-src/lib/prisma.ts
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: `file:${path.join(process.cwd(), "prisma", "dev.db")}`,
  },
});
