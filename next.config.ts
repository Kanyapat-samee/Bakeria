import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
};

module.exports = {
  images: {
    domains: ['bakeria-cakes.s3.ap-southeast-1.amazonaws.com',
    'bakeria-content-picture.s3.ap-southeast-1.amazonaws.com',],
  },
}

export default nextConfig;
