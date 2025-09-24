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
    // Allow external image hosts used by thumbnails
    domains: [
      'drive.google.com',
      'lh3.googleusercontent.com',
      'images.pexels.com',
    ],
  },
};

export default nextConfig;