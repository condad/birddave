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
  redirects: async () => {
    return [
      {
        source: "/login",
        destination:
          "https://birddave.auth.ca-central-1.amazoncognito.com/oauth2/authorize?client_id=dbkec3fspgno0e19pjnp0bkf9&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=http%3A%2F%2Flocalhost%3A300",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
