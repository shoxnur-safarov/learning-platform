/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: { domains: ['picsum.photos', 'images.unsplash.com'] }
};
module.exports = nextConfig;