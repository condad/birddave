import Link from "next/link";
import { Table } from "sst/node/table";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import getConfig from "next/config";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import Image from "next/image";

type Bird = {
  species: string;
  id: string;
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {birds.map((bird) => (
        <div key={bird.id} className="h-auto max-w-full rounded-lg sm:w-96 dark:bg-gray-700">
          <Link href={`/${bird.id}`}>
            <Image
              className="h-auto w-auto rounded-lg"
              src={`${publicRuntimeConfig.bucketUrl}/${bird.id}`}
              width={500}
              height={500}
              alt=""
            />
          </Link>
        </div>
      ))}

      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="space-y-8 animate-pulse rtl:space-x-reverse flex items-center justify-center bg-gray-100 max-h-auto max-w-full h-48 rounded-lg sm:w-96 dark:bg-gray-700">
          <svg
            className="w-10 h-10 text-gray-200 dark:text-gray-600"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 18">
            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
          </svg>
        </div>
      ))}
    </div>
  );
}
