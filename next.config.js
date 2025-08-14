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
        destination: '/JasperPortfolio2025.pdf',
        permanent: false,
      },
    ];
  },
}

module.exports = nextConfig 