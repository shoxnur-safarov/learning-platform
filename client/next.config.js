/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Development vaqtida sekinlikni kamaytiradi
  images: { domains: ['picsum.photos', 'images.unsplash.com'] }
};
module.exports = nextConfig;