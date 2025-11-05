/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Disable image optimization cache completely
    minimumCacheTTL: 0,
    unoptimized: process.env.NODE_ENV === 'production',
  },
  // Suppress hydration warnings in development
  reactStrictMode: true,
  compiler: {
    // Don't remove console logs in production for debugging
    removeConsole: false,
  },
  // Ensure upload directory is included in production build
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./upload/**/*'],
      '/api/serve-image/**/*': ['./upload/**/*'],
    },
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  },
  // Add static file serving for upload directory
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/serve-image/upload/:path*',
      },
    ];
  },
  // Disable all static optimization - force dynamic rendering
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;