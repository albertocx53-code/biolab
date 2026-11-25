import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // a second build folder lets a dev server run next to a production one (render scripts)
  distDir: process.env.BIOLAB_DIST_DIR || '.next',
  poweredByHeader: false,
  webpack(config, { isServer, webpack }) {
    if (!isServer) {
      // pptxgenjs (PowerPoint export in the Studio) has optional Node-only imports written as
      // "node:fs"; in the browser they are unused, so they resolve to empty modules.
      config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^node:/, (r: { request: string }) => void (r.request = r.request.replace(/^node:/, ''))));
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, https: false, os: false, path: false };
    }
    return config;
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Model files are content-addressed by version folder; cache aggressively.
        source: '/models/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      { source: '/draco/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ];
  },
};

export default nextConfig;
