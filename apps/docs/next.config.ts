import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@genuikit/core", "@genuikit/react", "@genuikit/adapters"],
  typescript: {
    // Type checking is done separately in CI via `tsc --noEmit`.
    // Skipping here avoids OOM with heavy Three.js type definitions.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
