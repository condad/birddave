"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthTokens, setAuthTokens, getUser } from "../utils";
import { AuthTokens } from "../types";
import { CurrentUserContext } from "../context";

export function UploadForm({ upload }: { upload: (formData: FormData) => Promise<void> }) {
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const { setCurrentUser } = useContext(CurrentUserContext);
  const router = useRouter();

  useEffect(() => {
    if (tokens !== null) {
      getUser().then((user) => {
        setCurrentUser(user);
      });
      return;
    }

    let authTokens = getAuthTokens();

    if (tokens !== authTokens) {
      getUser().then((user) => {
        setCurrentUser(user);
      });
      return setTokens(authTokens);
    }

    if (window.location.hash !== "") {
      const authTokens = setAuthTokens(window.location.hash);
      getUser().then((user) => {
        setCurrentUser(user);
      });
      return setTokens(authTokens);
    }

    if (process.env.NEXT_PUBLIC_SIGN_IN_URL === undefined) {
      throw new Error("Sign in URL not defined");
    }

    router.push(process.env.NEXT_PUBLIC_SIGN_IN_URL);
  }, [router, tokens, setCurrentUser]);

  if (!tokens) {
    // Loading Spinner
    return <>Loading</>;
  }

  return (
    <form action={upload} className="mx-24 bg-teal-300 shadow-md rounded pt-6 pb-8 mb-4 px-8 max-w-screen-md mx-auto">
      <input
        name="id"
        type="hidden"
        defaultValue={tokens.id_token}
        className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />

      <label htmlFor="file" className="block text-gray-700 text-sm font-bold mb-2">
        JPG
      </label>
      <input
        name="file"
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />

      <br />
      <label htmlFor="species" className="block text-gray-700 text-sm font-bold mb-2">
        Species
      </label>
      <input
        name="species"
        type="text"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />

      <br />
      <input
        type="submit"
        className="mt-5 shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
        value="Submit"
      />
    </form>
  );
}
