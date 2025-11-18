import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Exclude examples directory from build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    // Ignore examples directory
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/examples/**', '**/examples/**/*'],
    };
    return config;
  },
  // Exclude examples from page discovery
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Exclude examples from being treated as pages
  experimental: {
    // This helps exclude examples from build
  },
};

export default nextConfig;
