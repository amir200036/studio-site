import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
import { DEFAULT_TERMS } from "../src/lib/default-terms";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  const connectionString =
    process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ חסר POSTGRES_URL");
    process.exit(1);
  }

  let cleanedUrl = connectionString;
  try {
    const parsed = new URL(cleanedUrl);
    parsed.searchParams.delete("sslmode");
    cleanedUrl = parsed.toString();
  } catch {
    /* keep original */
  }

  const pool = new Pool({
    connectionString: cleanedUrl,
    ssl: { rejectUnauthorized: false },
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  await prisma.siteContent.upsert({
    where: { key: "terms_content" },
    update: { value: DEFAULT_TERMS },
    create: { key: "terms_content", value: DEFAULT_TERMS },
  });

  console.log("✅ terms_content עודכן במסד הנתונים");
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
