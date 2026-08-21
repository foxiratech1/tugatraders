import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.tugatraders.server24.in" },
      { protocol: "http", hostname: "api.tugatraders.server24.in" },
      { protocol: "https", hostname: "*.ngrok-free.dev" },
      { protocol: "http", hostname: "*.ngrok-free.dev" },
      { protocol: "https", hostname: "*.ngrok-free.app" },
      { protocol: "http", hostname: "*.ngrok-free.app" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "www.svgrepo.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
