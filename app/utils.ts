// todo: write decorater function to check for window definition
import {
  AdminGetUserCommandOutput,
  CognitoIdentityProviderClient,
  GetUserCommand,
  GetUserCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import queryString from "query-string";
import { AuthTokens, User } from "./types";
import { addSeconds, isAfter } from "date-fns";

const LOCAL_STORAGE_USER_KEY = "user";
const LOCAL_STORAGE_AUTH_TOKENS_KEY = "auth-tokens";
const LOCAL_STORAGE_AUTH_TOKENS_EXPIRY_KEY = `${LOCAL_STORAGE_AUTH_TOKENS_KEY}-expiry`;

export function getAuthTokens(): AuthTokens | null {
  if (typeof window === "undefined") {
    return null;
  }

  const authTokens = localStorage.getItem(LOCAL_STORAGE_AUTH_TOKENS_KEY);
  const authTokensExpiry = localStorage.getItem(LOCAL_STORAGE_AUTH_TOKENS_EXPIRY_KEY);

  if (authTokens === null || authTokensExpiry === null) {
    return null;
  }

  const now = new Date();
  const parsedAuthTokens = JSON.parse(authTokens) as AuthTokens;
  const parsedAuthTokensExpiry = new Date(authTokensExpiry);

  if (isAfter(now, parsedAuthTokensExpiry)) {
    localStorage.removeItem(LOCAL_STORAGE_AUTH_TOKENS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_AUTH_TOKENS_EXPIRY_KEY);
    return null;
  }

  return parsedAuthTokens;
}

export function setAuthTokens(hash: string): AuthTokens | null {
  if (typeof window === "undefined") {
    return null;
  }

  // todo: Verify the parsed query is the correct type
  const parsedHash = queryString.parse(window.location.hash);

  const authTokens: string = JSON.stringify(parsedHash);
  const authTokensExpiry = addSeconds(new Date(), Number(parsedHash.expires_in)).toISOString();

  localStorage.setItem(LOCAL_STORAGE_AUTH_TOKENS_KEY, authTokens);
  localStorage.setItem(LOCAL_STORAGE_AUTH_TOKENS_EXPIRY_KEY, authTokensExpiry);

  return parsedHash as unknown as AuthTokens;
}

export function parseUserCommandOutput(resp: GetUserCommandOutput | AdminGetUserCommandOutput): User {
  return {
    sub: resp.UserAttributes?.filter((attr) => attr.Name === "sub")[0]?.Value as string,
    email: resp.UserAttributes?.filter((attr) => attr.Name === "email")[0]?.Value as string,
    verified: Boolean(resp.UserAttributes?.filter((attr) => attr.Name === "email_verified")[0]?.Value),
  };
}

export async function getUser(): Promise<User | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const authTokens = getAuthTokens();

  if (authTokens === null) {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    return null;
  }

  const user = localStorage.getItem(LOCAL_STORAGE_USER_KEY);

  if (user !== null) {
    return JSON.parse(user);
  }

  const client = new CognitoIdentityProviderClient({ region: "us-east-1" });
  const getUserCmd = new GetUserCommand({ AccessToken: authTokens.access_token });
  const resp = await client.send(getUserCmd);

  const parsedUser = parseUserCommandOutput(resp);
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(parsedUser));

  return parsedUser;
}
