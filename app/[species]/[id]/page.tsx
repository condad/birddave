import Image from "next/image";
import { S3Client, ListObjectsCommand } from "@aws-sdk/client-s3";

export const dynamicParams = false;

const s3Client = new S3Client({ region: "ca-central-1" });

type Bird = {
  species: string;
  id: string;
};

export async function generateStaticParams(): Promise<Bird[]> {
  const birds: Bird[] = [];

  const resp = await s3Client.send(
    new ListObjectsCommand({ Bucket: process.env.IMAGE_BUCKET_NAME })
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
  const birdImageURL = `${process.env.IMAGE_BUCKET_URL}/${bird.species}-${bird.id}.jpg`;

  return (
    <div>
      <h1>Species: {bird.species.toUpperCase()}</h1>
      <Image src={birdImageURL} alt="" height="100" width="150" />
    </div>
  );
}
