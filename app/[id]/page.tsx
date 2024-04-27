import getConfig from "next/config";
import Image from "next/image";
import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { Table } from "sst/node/table";
import { notFound } from "next/navigation";
import { parseUserCommandOutput } from "../utils";
import { Bird } from "../types";

const dbClient = new DynamoDBClient();
const cognitoClient = new CognitoIdentityProviderClient();

export default async function Page({ params }) {
  const { publicRuntimeConfig } = getConfig();
  const birdImageURL = `${publicRuntimeConfig.bucketUrl}/${params.id}`;

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

  const user = parseUserCommandOutput(userResp);

  return (
    <div className="container mx-auto grid grid-cols-7">
      <div className="col-span-5">
        <Image src={birdImageURL} alt="" width={1000} height={1000} className="w-full" layout="responsive" />
      </div>
      <div className="col-span-2 pl-10">
        <h1>📖 {bird.species}</h1>
        <h2>📷 {user.email}</h2>
      </div>
    </div>
  );
}
