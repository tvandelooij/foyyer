import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://img.clerk.com/*")],
    formats: ["image/avif", "image/webp"],
  },

  // Enable compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Enable webpack tree shaking for better bundle optimization
  webpack: (config) => {
    config.optimization.usedExports = true;
    return config;
  },
};

export default nextConfig;
