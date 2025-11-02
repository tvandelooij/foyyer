import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://img.clerk.com/*")],
    formats: ["image/avif", "image/webp"],
  },

  // Optimize package imports to reduce bundle size
  optimizePackageImports: [
    "lucide-react",
    "@radix-ui/react-dialog",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-avatar",
    "@radix-ui/react-label",
    "@radix-ui/react-select",
    "@radix-ui/react-tabs",
  ],

  // Enable compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
