import { Bucket } from "sst/node/bucket";
import { Table } from "sst/node/table";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { idVerifier } from "../utils";
import { cookies } from "next/headers";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import FileDrop from "./file-drop";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UUID } from "crypto";

const s3Client = new S3Client();
const dbClient = new DynamoDBClient();

async function getPresignedUrl(key: string): Promise<string> {
  "use server";
  const command = new PutObjectCommand({
    Bucket: Bucket.public.bucketName,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

async function uploadPicture(formData: FormData): Promise<void> {
  "use server";

  let username: string;

  try {
    const cookieStore = cookies();
    const idTokenCookie = cookieStore.get("idToken") as RequestCookie;
    const idToken = idTokenCookie.value;
    const payload = await idVerifier.verify(idToken);

    username = payload["cognito:username"];
  } catch {
    throw new Error("Token invalid!");
  }

  // Validate species input
  const species = formData.get("species") as string;
  const [commonName, scientificName] = species.split(" - ");

  // Get crop position
  const cropPositionX = JSON.parse(formData.get("cropPosition") as string).x;
  const cropPositionY = JSON.parse(formData.get("cropPosition") as string).y;

  const insertCommand = new PutCommand({
    TableName: Table.table.tableName,
    Item: {
      id: formData.get("key") as UUID,
      species: scientificName.toLowerCase(),
      commonName: commonName,
      uploadedAt: new Date().toISOString(),
      originalWidth: Number(formData.get("originalWidth")),
      originalHeight: Number(formData.get("originalHeight")),
      thumbnailWidth: Number(formData.get("thumbnailWidth")),
      thumbnailHeight: Number(formData.get("thumbnailHeight")),
      cropPositionX: Number(cropPositionX),
      cropPositionY: Number(cropPositionY),
      username,
    },
  });

  await dbClient.send(insertCommand);
}

export default function Page() {
  return (
    <div className="container mx-auto">
      <FileDrop uploadPicture={uploadPicture} getPresignedUrl={getPresignedUrl} />
    </div>
  );
}
