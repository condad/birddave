import { Bucket } from "sst/node/bucket";

/**
 * @type {import('next').NextConfig}
 * */
const nextConfig = {
  webpack: (config, options) => {
    if (!options.dev) {
      config.devtool = "source-map";
    }
    return config;
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${Bucket.public.bucketName}.s3.amazonaws.com`,
      },
    ],
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    bucketUrl: `https://${Bucket.public.bucketName}.s3.amazonaws.com`,
  },
};

export default nextConfig;
