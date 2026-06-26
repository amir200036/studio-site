import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";

export type AdminAccount = {
  email: string;
  password: string;
};

/** מנהלים מ-ADMIN_EMAIL / ADMIN_PASSWORD ו-ADMIN_EMAIL_2 / ADMIN_PASSWORD_2 */
export function getAdminAccounts(): AdminAccount[] {
  const pairs: [string | undefined, string | undefined][] = [
    [process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD],
    [process.env.ADMIN_EMAIL_2, process.env.ADMIN_PASSWORD_2],
  ];

  const accounts: AdminAccount[] = [];
  for (const [email, password] of pairs) {
    const trimmedEmail = email?.trim();
    if (trimmedEmail && password) {
      accounts.push({ email: trimmedEmail, password });
    }
  }
  return accounts;
}

export async function verifyAdminCredentials(
  email: string,
  password: string,
  clientKey = "unknown"
): Promise<AdminAccount | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const throttleKey = `${clientKey}:${normalizedEmail}`;
  const { allowed } = rateLimit(throttleKey, "admin-login", {
    maxRequests: 8,
    windowMs: 15 * 60_000,
  });
  if (!allowed) return null;

  const account = getAdminAccounts().find((a) => a.email.toLowerCase() === normalizedEmail);
  if (!account) return null;

  let isValid = false;
  if (account.password.startsWith("$2")) {
    isValid = await bcrypt.compare(password, account.password);
  } else if (process.env.NODE_ENV === "production") {
    console.error(`ADMIN_PASSWORD חייב להיות bcrypt hash בפרודקשן ($2...) — ${email}`);
    return null;
  } else {
    isValid = password === account.password;
  }

  return isValid ? account : null;
}
