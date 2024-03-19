"use client";

import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  GetUserCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

async function getCognitoUser(): Promise<GetUserCommandOutput | undefined> {
  if (typeof window !== "undefined") {
    const client = new CognitoIdentityProviderClient({ region: "ca-central-1" });
    const hash = window.location.hash;

    if (hash) {
      // TODO: Use regex to parse the hash
      const [idField, accessTokenField, ..._] = hash.split("&");
      const accesstoken = accessTokenField.split("=")[1];

      return await client.send(new GetUserCommand({ AccessToken: accesstoken }));
    }
  }
}

export function UploadForm({ upload }: { upload: (formData: FormData | string) => Promise<void> }) {
  const [user, setUser] = useState<GetUserCommandOutput | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    getCognitoUser().then((user) => {
      if (user === undefined) {
        router.push("/login");
        return;
      }

      setUser(user);
    });
  }, []);

  if (user === undefined) {
    // Loading Spinner
    return <></>;
  }

  return (
    <form action={upload} className="mx-24 bg-teal-300 shadow-md rounded pt-6 pb-8 mb-4 px-8 max-w-screen-md mx-auto">
      <input
        name="username"
        type="hidden"
        defaultValue={user.Username}
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
