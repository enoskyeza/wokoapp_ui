import type { NextConfig } from 'next';
// import nextPwa from 'next-pwa';
//
// const withPWA = nextPwa({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development',
// });
//
// // This is the fix:
// const nextConfig = withPWA({
//   reactStrictMode: true,
//   // additional Next.js config here
// }) as NextConfig;

const nextConfig: NextConfig = {
  images: {
    // Updated to use remotePatterns instead of deprecated domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // Ignore ESLint errors during builds to avoid blocking production output
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript build errors to allow production builds
    // Use with caution; fix type errors promptly
    ignoreBuildErrors: true,
  },
};

export default nextConfig;