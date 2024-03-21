"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import queryString from "query-string";

type CognitoTokens = {
  id_token: string;
  access_token: string;
  expires_in: number;
};

export function UploadForm({ upload }: { upload: (formData: FormData | string) => Promise<void> }) {
  const [cognitoTokens, setCognitoTokens] = useState<CognitoTokens | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const cognitoTokens = queryString.parse(window.location.hash);

    if (cognitoTokens.id_token === undefined) {
      return router.push("/login");
    }

    // TODO: Verify the parsed query is the correct type
    setCognitoTokens(cognitoTokens as unknown as CognitoTokens);
  }, []);

  if (cognitoTokens === undefined) {
    // Loading Spinner
    return <></>;
  }

  return (
    <form action={upload} className="mx-24 bg-teal-300 shadow-md rounded pt-6 pb-8 mb-4 px-8 max-w-screen-md mx-auto">
      <input
        name="id"
        type="hidden"
        defaultValue={cognitoTokens.id_token}
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
