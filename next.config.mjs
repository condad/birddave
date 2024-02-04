/**
 * @type {import('next').NextConfig}
 * */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "birddave.s3.ca-central-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
