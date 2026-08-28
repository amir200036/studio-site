import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyAdminCredentials } from "@/lib/admin-credentials";

/** אימות מנהלים לפי ADMIN_EMAIL / ADMIN_PASSWORD (+ _2 אופציונלי) */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "מייל", type: "email" },
        password: { label: "סיסמה", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        // בלי מפתח לקוח, מגבלת הקצב הייתה גלובלית לכל כתובת מייל —
        // 8 ניסיונות כושלים מכל מקום בעולם היו נועלים את המנהל האמיתי.
        const headers = req?.headers as Record<string, string | undefined> | undefined;
        const forwarded = headers?.["x-forwarded-for"];
        const clientKey =
          headers?.["x-real-ip"]?.trim() ||
          forwarded?.split(",").map((p) => p.trim()).filter(Boolean).pop() ||
          "unknown";

        const account = await verifyAdminCredentials(
          credentials.email,
          credentials.password,
          clientKey
        );
        if (!account) return null;

        return {
          id: account.email,
          email: account.email,
          name: "מנהל",
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = "admin";
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { role?: string }).role = token.role as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
