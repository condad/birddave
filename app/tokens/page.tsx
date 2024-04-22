"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LOCAL_STORAGE_AUTH_TOKENS_KEY, LOCAL_STORAGE_AUTH_TOKENS_EXPIRY_KEY } from "../utils";
import { AuthContext } from "../context";
import { addSeconds } from "date-fns";
import queryString from "query-string";

export default function Page({ _ }) {
  const router = useRouter();
  const { setAuthTokens } = useContext(AuthContext);

  useEffect(() => {
    const parsedHash = queryString.parse(window.location.hash);

    const authTokens: string = JSON.stringify(parsedHash);
    const authTokensExpiry = addSeconds(new Date(), Number(parsedHash.expires_in)).toISOString();

    localStorage.setItem(LOCAL_STORAGE_AUTH_TOKENS_KEY, authTokens);
    localStorage.setItem(LOCAL_STORAGE_AUTH_TOKENS_EXPIRY_KEY, authTokensExpiry);

    setAuthTokens(parsedHash);

    router.push("/upload");
  }, [router, setAuthTokens]);

  return <div className="container mx-auto">loading...</div>;
}
