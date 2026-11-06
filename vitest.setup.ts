import { config } from "dotenv";

// אותו סדר קדימויות של prisma.config.ts. בלי זה, בדיקות שנוגעות במסד
// מקבלות connection string ריק, ו-pg מנסה SSL מול Postgres מקומי שלא תומך בו.
config({ path: ".env.development.local" });
config({ path: ".env.local" });
config();
