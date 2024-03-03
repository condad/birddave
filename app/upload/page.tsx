import { Bucket } from "sst/node/bucket";
import { Table } from "sst/node/table";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export default async function Page() {
  async function uploadPicture(formData: FormData) {
    "use server";

    const file = formData.get("file") as File;
    const species = formData.get("species") as string;

    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);

    const id = uuidv4();

    const s3Client = new S3Client();
    const command = new PutObjectCommand({
      Body: fileBuffer,
      Bucket: Bucket.public.bucketName,
      Key: id,
      ContentType: file.type,
    });

    const dbClient = new DynamoDBClient();
    const insertCommand = new PutCommand({
      TableName: Table.table.tableName,
      Item: {
        id: id,
        species,
      },
    });

    const s3Response = await s3Client.send(command);
    const dbResponse = await dbClient.send(insertCommand);

    console.log("s3 response", s3Response);
    console.log("dynamobdb response", dbResponse);
  }

  return (
    <form action={uploadPicture} className="mx-24 bg-teal-300 shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <label htmlFor="file" className="block text-gray-700 text-sm font-bold mb-2">
        JPG
      </label>
      <input
        name="file"
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />

      <br />
      <label htmlFor="species" className="block text-gray-700 text-sm font-bold mb-2">
        Species
      </label>
      <input
        name="species"
        type="text"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />

      <br />
      <input
        type="submit"
        className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
        value="Submit"
      />
    </form>
  );
}
