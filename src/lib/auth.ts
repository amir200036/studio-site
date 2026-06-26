import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

/** מנהל יחיד — אימות לפי ADMIN_EMAIL / ADMIN_PASSWORD (או bcrypt) בלבד */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "מייל", type: "email" },
        password: { label: "סיסמה", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) return null;
        if (credentials.email !== adminEmail) return null;

        let isValid = false;
        if (adminPassword.startsWith("$2")) {
          isValid = await bcrypt.compare(credentials.password, adminPassword);
        } else if (process.env.NODE_ENV === "production") {
          console.error("ADMIN_PASSWORD חייב להיות bcrypt hash בפרודקשן ($2...)");
          return null;
        } else {
          isValid = credentials.password === adminPassword;
        }

        if (!isValid) return null;

        return {
          id: "admin",
          email: adminEmail,
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
    maxAge: 24 * 60 * 60,    // 24 שעות
    updateAge: 60 * 60,       // מתרענן כל שעה אם פעיל
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
