/**
 * @type {import('next').NextConfig}
 * */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com`,
      },
    ],
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    bucketUrl: `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com`,
  },
};

export default nextConfig;
