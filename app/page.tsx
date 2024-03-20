import Link from "next/link";
import { Table } from "sst/node/table";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import getConfig from "next/config";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import Image from "next/image";

type Bird = {
  species: string;
  id: string;
  username: string;
};

async function getBirds(): Promise<Bird[]> {
  // TODO: This function should run on every request, not just at build time.
  const dbClient = new DynamoDBClient();

  const resp = await dbClient.send(new ScanCommand({ TableName: Table.table.tableName }));
  return resp.Items as Bird[];
}

export default async function Home() {
  const birds = await getBirds();
  const { publicRuntimeConfig } = getConfig();

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
        {birds.map((bird) => (
          <Link href={`/${bird.id}`} passHref legacyBehavior>
            <a
              key={bird.id}
              className="block max-w-full rounded-lg w-full dark:bg-gray-700 overflow-hidden relative h-56 object-cover">
              <Image
                className="object-cover hover:opacity-50"
                src={`${publicRuntimeConfig.bucketUrl}/${bird.id}`}
                alt=""
                fill
              />
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
