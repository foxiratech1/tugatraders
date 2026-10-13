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
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "http", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "c36e4cc270a925caf172c1c447e16416.r2.cloudflarestorage.com" },
      { protocol: "http", hostname: "c36e4cc270a925caf172c1c447e16416.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "*.firebasestorage.app" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "www.svgrepo.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
