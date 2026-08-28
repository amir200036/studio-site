/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  images: {
    // מוגבל ל-Vercel Blob בלבד. עם hostname "**" כל אחד יכול לקרוא ל-
    // /_next/image?url=<כל כתובת> ולהשתמש בדפלוימנט הזה כפרוקסי אופטימיזציה
    // על חשבון רוחב הפס שלנו — אומת בפועל מול האתר החי.
    // כל התמונות באתר מגיעות מ-/api/admin/upload, שמחזיר תמיד כתובת Blob.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
