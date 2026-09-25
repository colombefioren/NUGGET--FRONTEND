import type { NextConfig } from "next";

const apiUrl = process.env.NUGGET_API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Streaming answers are sent as server-sent events; gzip would buffer them.
  compress: false,
  devIndicators: false,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/:path*` }];
  },
};

export default nextConfig;
