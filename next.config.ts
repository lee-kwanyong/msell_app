import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/policies/terms",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/policies/privacy",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/policies/advertising-policy",
        destination: "/advertising-policy",
        permanent: true,
      },
      {
        source: "/policies/seller-policy",
        destination: "/seller-policy",
        permanent: true,
      },
      {
        source: "/policies/dispute-policy",
        destination: "/dispute-policy",
        permanent: true,
      },
      {
        source: "/policies/dispute",
        destination: "/dispute-policy",
        permanent: true,
      },
      {
        source: "/policies/report",
        destination: "/dispute-policy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;