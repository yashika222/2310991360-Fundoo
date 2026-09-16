/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    webpackBuildWorker: false,
    cpus: 1,
    serverComponentsExternalPackages: ['mongoose', 'winston', 'nodemailer', 'bcryptjs'],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 2000,
        aggregateTimeout: 800,
        ignored: /node_modules|\.git|\.next/,
      };
    }
    return config;
  },
};

export default nextConfig;
