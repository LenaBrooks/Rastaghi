import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reuse previously visited dynamic pages (e.g. /admin) on soft back
  // instead of refetching every time. Mutations still call revalidatePath.
  experimental: {
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
