/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverBodySizeLimit: "8mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
