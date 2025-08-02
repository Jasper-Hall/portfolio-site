/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['freight.cargo.site'],
  },
  experimental: {
    optimizePackageImports: ['p5'],
  },
}

module.exports = nextConfig 