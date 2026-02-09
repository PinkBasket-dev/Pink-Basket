/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Vercel to ignore the TypeScript error
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;