import Link from "next/link";
import { S3Client, ListObjectsCommand } from "@aws-sdk/client-s3";

type Bird = {
  species: string;
  id: string;
};

async function getBirds(): Promise<Bird[]> {
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

export default async function Home() {
  const birds = await getBirds();

  return (
    <main>
      <h1>Birddave</h1>

      <ul>
        {birds.map((bird) => (
          <li key={bird.species}>
            <Link href={`/${bird.species}/${bird.id}`}>
              {bird.species}—{bird.id}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
