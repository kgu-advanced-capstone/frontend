import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiDestination =
      process.env.NODE_ENV === "development"
        ? "http://localhost:8080/api/:path*"
        : "https://pcserver.cloud/api/:path*";

    return [
      {
        source: "/api/:path*",
        destination: apiDestination,
      },
    ];
  },
};

export default nextConfig;
