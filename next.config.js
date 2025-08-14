/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['freight.cargo.site'],
  },
  experimental: {
    optimizePackageImports: ['p5'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/Jasper2024Portfolio-compressed.pdf',
        permanent: false,
      },
    ];
  },
}

module.exports = nextConfig 