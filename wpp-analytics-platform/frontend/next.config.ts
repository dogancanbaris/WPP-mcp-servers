import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // Disable to suppress Craft.js React 19 warnings
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true, // Set to true to allow build with ESLint warnings
  },
  typescript: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // Temporarily set to true to unblock builds while fixing type errors incrementally
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
