import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Do not fail the production build if ESLint errors are present
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      // Keep /dashboard working if you still link to it anywhere
      // but prefer /employee as the canonical staff dashboard
      // Remove or adjust as needed
  // Common typos previously redirected to '/employee' now go to '/dashboardstaff'
  { source: '/emloyee', destination: '/dashboardstaff', permanent: false },
  { source: '/employye', destination: '/dashboardstaff', permanent: false },
      // Note: Do NOT redirect '/employee/:path*' to avoid intercepting bare '/employee'
    ];
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api';
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
