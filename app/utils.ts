import { AdminGetUserCommandOutput, GetUserCommandOutput } from "@aws-sdk/client-cognito-identity-provider";
import { cookies } from "next/headers";
import { User } from "./types";
import { CognitoJwtVerifier } from "aws-jwt-verify";

export const idVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID as string,
  tokenUse: "id",
  clientId: process.env.COGNITO_CLIENT_ID as string,
});

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const idTokenCookie = cookieStore.get("idToken");

  if (!idTokenCookie) {
    return null;
  }

  try {
    const verifiedId = await idVerifier.verify(idTokenCookie.value);
    return {
      sub: verifiedId.sub,
      email: verifiedId.email as string,
      verified: verifiedId.email_verified,
    };
  } catch {
    return null;
  }
}

export function parseUserCommandOutput(resp: GetUserCommandOutput | AdminGetUserCommandOutput): User {
  return {
    sub: resp.UserAttributes?.filter((attr) => attr.Name === "sub")[0]?.Value as string,
    email: resp.UserAttributes?.filter((attr) => attr.Name === "email")[0]?.Value as string,
    verified: Boolean(resp.UserAttributes?.filter((attr) => attr.Name === "email_verified")[0]?.Value),
  };
}
