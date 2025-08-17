import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  /* config options here */
  experimental: {
    // appDir is no longer an experimental feature in newer Next.js versions
    // Remove or uncomment if needed for your specific Next.js version
    // appDir: true,
  },
  // 配置D1数据库绑定
  cloudflare: {
    bindings: {
      DB: {
        type: 'd1',
        databaseId: process.env.D1_DATABASE_ID || '',
      },
    },
  },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
