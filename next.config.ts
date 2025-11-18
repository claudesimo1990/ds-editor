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
    return config;
  },
};

export default nextConfig;
