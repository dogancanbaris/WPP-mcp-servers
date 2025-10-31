import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    // Allow builds to proceed despite ESLint warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily allow builds to proceed despite TS errors while migrating
    ignoreBuildErrors: true,
  },
  // Stabilize file tracing in this multi-lockfile workspace and silence root warnings
  outputFileTracingRoot: path.join(__dirname, "..", ".."),
};

export default nextConfig;
