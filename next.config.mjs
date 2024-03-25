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
