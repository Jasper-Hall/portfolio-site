/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['freight.cargo.site'],
  },
  experimental: {
    optimizePackageImports: ['p5'],
  },
  async redirects() {
    // Skip PDF redirect if BYPASS_PDF_REDIRECT is set or if in development
    if (process.env.NODE_ENV === 'production' && !process.env.BYPASS_PDF_REDIRECT) {
      return [
        {
          source: '/',
          destination: '/JasperPortfolio2025.pdf',
          permanent: false,
        },
      ];
    }
    // No redirects in development or when bypass is enabled
    return [];
  },
}

module.exports = nextConfig 