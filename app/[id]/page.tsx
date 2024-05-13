import getConfig from "next/config";
import Image from "next/image";
import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Table } from "sst/node/table";
import { notFound } from "next/navigation";
import DetailPanel from "./DetailPanel";
import { getCurrentUser, parseUserCommandOutput } from "../utils";
import { Bird } from "../types";
import { S3Client } from "@aws-sdk/client-s3";
import { Bucket } from "sst/node/bucket";

const s3Client = new S3Client();
const dbClient = new DynamoDBClient();
const cognitoClient = new CognitoIdentityProviderClient();

async function deletePhoto(id: string): Promise<void> {
  // todo: check the current user is the author of the photo
  "use server";

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  await dbClient.send(
    new DeleteCommand({
      TableName: Table.table.tableName,
      Key: {
        id: id,
      },
    })
  );
  await s3Client.send(new DeleteObjectCommand({ Bucket: Bucket.public.bucketName, Key: id }));
}

export default async function Page({ params }) {
  const { publicRuntimeConfig } = getConfig();
  const birdImageURL = `${publicRuntimeConfig.bucketUrl}/${params.id}`;

  const currentUser = await getCurrentUser();

  const command = new GetCommand({
    TableName: Table.table.tableName,
    Key: {
      id: params.id,
    },
  });
  const dbResp = await dbClient.send(command);

  if (!dbResp.Item) {
    return notFound();
  }
  const bird = dbResp.Item as Bird;

  const getUserCommand = new AdminGetUserCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: bird.username,
  });
  const userResp = await cognitoClient.send(getUserCommand);

  const author = parseUserCommandOutput(userResp);

  return (
    <div className="container mx-auto h-screen flex flex-row flex-wrap">
      <div className="flex-auto relative basis-3/4 h-3/4">
        <Image src={birdImageURL} alt="" className="object-cover" fill />
      </div>
      <div className="flex-auto pl-5">
        <DetailPanel bird={bird} author={author} currentUser={currentUser} deletePhoto={deletePhoto} />
      </div>
    </div>
  );
}
