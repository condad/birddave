import Image from "next/image";
import { S3Client, ListObjectsCommand } from "@aws-sdk/client-s3";
import getConfig from "next/config";

export const dynamicParams = false;

type Bird = {
  species: string;
  id: string;
};

export async function generateStaticParams(): Promise<Bird[]> {
  const birds: Bird[] = [];
  const s3Client = new S3Client({ region: process.env.BUCKET_REGION });

  const resp = await s3Client.send(
    new ListObjectsCommand({ Bucket: process.env.BUCKET_NAME })
  );

  const respContents = resp.Contents;

  for (const obj of respContents as Array<any>) {
    const file = obj.Key as string;
    const [key, ..._] = file.split(".");
    const [species, id] = key.split("-");

    birds.push({ species, id });
  }

  return birds;
}

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default async function Page({ params }) {
  const bird = params;

  const { publicRuntimeConfig } = getConfig();
  const birdImageURL = `${publicRuntimeConfig.bucketUrl}/${bird.species}-${bird.id}.jpg`;

  return (
    <div>
      <h1>Species: {bird.species.toUpperCase()}</h1>
      <Image src={birdImageURL} alt="" height="100" width="150" />
    </div>
  );
}
