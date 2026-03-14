import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Para resolver alguns problemas de carregamento de config no Windows
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
