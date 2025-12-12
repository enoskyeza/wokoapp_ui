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
      {
        protocol: 'https',
        hostname: 'kyeza.pythonanywhere.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    // Ignore TypeScript build errors to allow production builds
    // Use with caution; fix type errors promptly
    ignoreBuildErrors: true,
  },
};

export default nextConfig;