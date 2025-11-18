import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Turbopack configuration (Next.js 16 uses Turbopack by default)
  turbopack: {},
  // Exclude examples from page discovery
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

export default nextConfig;
