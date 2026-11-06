import { randomUUID } from "node:crypto";
import { securityLog } from "@/lib/security-log";

const TRANSIENT_DATABASE_CODES = new Set(["P1001", "P1002", "P1008", "P1017"]);

function databaseErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("code" in error)) return undefined;
  return typeof error.code === "string" ? error.code : undefined;
}

export function isFatalDatabaseError(error: unknown): boolean {
  return !TRANSIENT_DATABASE_CODES.has(databaseErrorCode(error) ?? "");
}

/** מחזיר fallback רק לתקלת חיבור זמנית ומעלה מחדש שגיאות schema או תכנות. */
export async function safeDbQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const code = databaseErrorCode(err) ?? "unknown";
    securityLog("database_query_failed", {
      category: code,
      outcome: isFatalDatabaseError(err) ? "fatal" : "fallback",
      correlationId: randomUUID(),
      environment: process.env.APP_ENVIRONMENT ?? "unknown",
    });
    if (isFatalDatabaseError(err)) throw err;
    return fallback;
  }
}
