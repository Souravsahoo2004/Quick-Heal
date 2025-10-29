// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.convex.cloud',
        port: '',
        pathname: '/api/storage/**',
      },
    ],
    unoptimized: true, // Disable image optimization to prevent timeout with Convex storage
  },
};

export default nextConfig;
