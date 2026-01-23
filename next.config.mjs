/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@react-pdf/renderer'],
  webpack: (config, { isServer }) => {
    // Exclude PDF renderer from server-side bundling
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@react-pdf/renderer': '@react-pdf/renderer',
      });
    }

    // Handle PDF renderer imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-pdf/renderer': require.resolve('@react-pdf/renderer'),
    };

    return config;
  },
}

export default nextConfig
