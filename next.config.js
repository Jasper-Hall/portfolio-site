/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['freight.cargo.site'],
  },
  experimental: {
    optimizePackageImports: ['p5'],
  },
  async redirects() {
    // No redirects for this feature branch - allows testing view toggle system
    return [];
  },
}

module.exports = nextConfig 