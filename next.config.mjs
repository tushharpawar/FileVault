/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['byfeifufgjywbxgwzfwn.supabase.co'],
  },
  // Suppress warnings for Supabase WebSocket factory
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Suppress the websocket factory warning
    config.module.exprContextCritical = false
    
    return config
  },
}

export default nextConfig
