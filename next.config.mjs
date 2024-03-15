import { Bucket } from "sst/node/bucket";

/**
 * @type {import('next').NextConfig}
 * */
const nextConfig = {
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
  redirects: async () => {
    return [
      {
        source: "/login",
        destination: process.env.COGNITO_SIGN_IN_URL,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
