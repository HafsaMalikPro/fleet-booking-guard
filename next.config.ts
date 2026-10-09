import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root: a parent directory has its own lockfile.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
