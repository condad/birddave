import { Bucket } from "sst/node/bucket";
import { Table } from "sst/node/table";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { idVerifier } from "../verifiers";
import { cookies } from "next/headers";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

export default function Page() {
  async function uploadPicture(formData: FormData) {
    "use server";

    let username: string;

    const cookieStore = cookies();
    const idTokenCookie = cookieStore.get("idToken") as RequestCookie;

    const file = formData.get("file") as File;
    const species = formData.get("species") as string;
    const idToken = idTokenCookie.value;

    try {
      const payload = await idVerifier.verify(idToken);
      username = payload.sub;
    } catch {
      throw new Error("Token invalid!");
    }

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
        username,
      },
    });

    // TODO: Run in parallel
    const s3Response = await s3Client.send(command);
    const dbResponse = await dbClient.send(insertCommand);
  }

  return (
    <div className="container mx-auto">
      <form
        action={uploadPicture}
        className="mx-24 bg-teal-300 shadow-md rounded pt-6 pb-8 mb-4 px-8 max-w-screen-md mx-auto">
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
          className="mt-5 shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
          value="Submit"
        />
      </form>
    </div>
  );
}
