"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LOCAL_STORAGE_AUTH_TOKENS_KEY, LOCAL_STORAGE_AUTH_TOKENS_EXPIRY_KEY } from "../utils";
import { AuthContext } from "../context";
import { addSeconds } from "date-fns";
import queryString from "query-string";
import { AuthTokens } from "../types";
import { getUser } from "../utils";

export default function Page() {
  const router = useRouter();
  const { setAuthTokens, setCurrentUser } = useContext(AuthContext);

  useEffect(() => {
    const parsedHash = queryString.parse(window.location.hash) as unknown as AuthTokens;

    document.cookie = `idToken=${parsedHash.id_token}; max-age=${parsedHash.expires_in}; path=/`;

    const authTokens: string = JSON.stringify(parsedHash);
    const authTokensExpiry = addSeconds(new Date(), Number(parsedHash.expires_in)).toISOString();

    localStorage.setItem(LOCAL_STORAGE_AUTH_TOKENS_KEY, authTokens);
    localStorage.setItem(LOCAL_STORAGE_AUTH_TOKENS_EXPIRY_KEY, authTokensExpiry);

    setAuthTokens(parsedHash);

    // todo: should we wait for this to resolve before redirecting?
    getUser().then((user) => {
      setCurrentUser(user);
    });

    router.push("/upload");
  }, [router, setAuthTokens, setCurrentUser]);

  return <div className="container mx-auto">loading...</div>;
}
