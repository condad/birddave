import getConfig from "next/config";
import Image from "next/image";
import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { Table } from "sst/node/table";
import { notFound } from "next/navigation";

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

  const getUserCommand = new AdminGetUserCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: dbResp.Item?.username,
  });

  const userResp = await cognitoClient.send(getUserCommand);
  // const userEmail = userResp.UserAttributes[2].Value;
  const userEmail = userResp.UserAttributes?.filter((attr) => attr.Name === "email")[0]?.Value;

  return (
    <div className="container mx-auto">
      <div className="w-full mb-4">
        <h2>User: {userEmail}</h2>
        <h2>Species: {dbResp.Item?.species}</h2>
      </div>
      <Image src={birdImageURL} alt="" width={1000} height={1000} className="w-full" layout="responsive" />
    </div>
  );
}
