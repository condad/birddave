"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import queryString from "query-string";
import { AuthTokens } from "../types";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const parsedHash = queryString.parse(window.location.hash) as unknown as AuthTokens;

    document.cookie = `idToken=${parsedHash.id_token}; max-age=${parsedHash.expires_in}; path=/; SameSite=Strict; Secure`;

    router.push("/upload");
    router.refresh(); // Server needs to know about the new cookie
  }, [router]);

  return <div className="container mx-auto">loading...</div>;
}
