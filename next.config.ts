import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://pcserver.cloud/api/:path*",
      },
    ];
  },
};

export default nextConfig;
