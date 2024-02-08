import { Inter } from "next/font/google";
import { Bucket } from "sst/node/bucket";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import UploadForm from "./upload";

const inter = Inter({ subsets: ["latin"] });

async function getPresignedUrl(): Promise<string> {
  const client = new S3Client();
  const command = new PutObjectCommand({
    Bucket: Bucket.public.bucketName,
    Key: "another-1.jpg",
  });

  return await getSignedUrl(client, command, { expiresIn: 3600 });
}

export default async function Page() {
  const url = await getPresignedUrl();

  return (
    <main>
      <UploadForm url={url} />
    </main>
  );
}
