import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The app sits inside other folders with their own lockfiles; pin the root to this project.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
