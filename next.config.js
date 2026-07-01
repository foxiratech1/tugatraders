/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "api.tugatraders.server24.in",
      },
      {
        protocol: 'http',
        hostname: "api.tugatraders.server24.in",
      },
      {
        protocol: 'https',
        hostname: "*.ngrok-free.dev",
      },
      {
        protocol: 'http',
        hostname: "*.ngrok-free.dev",
      },
      {
        protocol: 'https',
        hostname: "*.ngrok-free.app",
      },
      {
        protocol: 'http',
        hostname: "*.ngrok-free.app",
      },
    ],
    // Optional: you can also enable domains if using older Next versions
    // domains: ['whiny-vanesa-unhandicapped.ngrok-free.dev'],
  },
  // other Next.js config options can go here
};

module.exports = nextConfig;
