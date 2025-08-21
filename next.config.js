/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['freight.cargo.site'],
  },
  experimental: {
    optimizePackageImports: ['p5'],
  },
  async redirects() {
    // Only redirect to PDF in production
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/',
          destination: '/JasperPortfolio2025.pdf',
          permanent: false,
        },
      ];
    }
    // No redirects in development
    return [];
  },
}

module.exports = nextConfig 