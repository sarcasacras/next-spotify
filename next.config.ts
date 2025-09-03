import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('https://i.scdn.co/**'),
      new URL('https://platform-lookaside.fbsbx.com/**'),
      new URL('https://scontent-*.xx.fbcdn.net/**'),
    ],
  },
};

export default nextConfig;
