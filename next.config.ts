import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Ensure proper hydration
  reactStrictMode: true,
  // Disable server-side rendering for pages that need client-side auth
  unstable_runtimeJS: true,
};

export default nextConfig;
