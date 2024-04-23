import { CognitoJwtVerifier } from "aws-jwt-verify";

export const idVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID as string,
  tokenUse: "id",
  clientId: process.env.COGNITO_CLIENT_ID as string,
});
