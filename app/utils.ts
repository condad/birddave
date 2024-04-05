// todo: write decorater function to check for window definition

"use client";

import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  GetUserCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import queryString from "query-string";
import { AuthTokens } from "./types";

const LOCAL_STORAGE_USER_TOKENS_KEY = "user-tokens";

export function getAuthTokens(): AuthTokens | null {
  if (typeof window === "undefined") {
    return null;
  }

  // todo: Set expiry time stamp to compare against, instead of timeout
  const tokens = localStorage.getItem(LOCAL_STORAGE_USER_TOKENS_KEY);
  return tokens ? JSON.parse(tokens) : null;
}

export function setAuthTokens(hash: string): AuthTokens | null {
  if (typeof window === "undefined") {
    return null;
  }

  const parsedHash = queryString.parse(window.location.hash);

  // todo: Verify the parsed query is the correct type
  localStorage.setItem(LOCAL_STORAGE_USER_TOKENS_KEY, JSON.stringify(parsedHash));

  // todo: set expiry time stamp
  // const timeoutMs = Number(parsedHash.expires_in) * 1000;
  // localStorage.setItem("user_tokens_expiry", JSON.stringify(parsedHash));

  return parsedHash as unknown as AuthTokens;
}

// TODO: Return our custom 'User type'
export async function getUser(): Promise<GetUserCommandOutput | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const userTokens = getAuthTokens();

  if (userTokens === null) {
    return null;
  }

  const client = new CognitoIdentityProviderClient({ region: "us-east-1" });
  const getUserCmd = new GetUserCommand({ AccessToken: userTokens.access_token });
  return await client.send(getUserCmd);
}
