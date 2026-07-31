import type { NextConfig } from "next";

const httpHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // performance — enables DNS pre-resolution for linked origins
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: httpHeaders,
      },
      {
        // The 3D model is content-addressed by filename and only ever replaced
        // wholesale, so it can be cached hard. Without this it is revalidated
        // on every visit, which is most of why the stage felt slow to appear.
        source: "/models/:path*",
        headers: [
          ...httpHeaders,
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
