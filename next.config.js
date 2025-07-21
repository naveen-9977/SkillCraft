/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // This will allow images from any HTTPS source
      },
      {
        protocol: 'http',
        hostname: '**', // This will allow images from any HTTP source
      }
    ],
  },
}

module.exports = nextConfig
