import { Bucket } from "sst/node/bucket";
import { Table } from "sst/node/table";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { idVerifier } from "../utils";
import { cookies } from "next/headers";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { Form } from "./form";

export default function Page() {
  async function uploadPicture(formData: FormData) {
    "use server";

    let username: string;

    const cookieStore = cookies();
    const idTokenCookie = cookieStore.get("idToken") as RequestCookie;

    const file = formData.get("file") as File;
    const species = formData.get("species") as string;
    const idToken = idTokenCookie.value;
    const [commonName, scientificName] = species.split(" - ");

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
        species: scientificName.toLowerCase(),
        commonName: commonName,
        username,
      },
    });

    // TODO: Run in parallel
    const s3Response = await s3Client.send(command);
    const dbResponse = await dbClient.send(insertCommand);
  }

  return (
    <div className="container mx-auto">
      <Form uploadPicture={uploadPicture} />
    </div>
  );
}
