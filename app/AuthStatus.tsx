"use client";

import { type User } from "./types";
import { useRouter } from "next/navigation";

export function AuthStatus({ currentUser }: { currentUser: User | null }) {
  const router = useRouter();

  function logout() {
    // TODO: Call logout endpoint
    console.log("Logging out");
    document.cookie = "idToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
    return router.refresh();
  }

  if (currentUser === null) {
    return (
      <div className="text-sm">
        <a href="/upload" className="text-blue-500 hover:underline hover:inline">
          Login
        </a>
      </div>
    );
  }

  return (
    <div className="text-sm">
      {"Logged in as " + currentUser.email}
      {" | "}
      <a href="#" onClick={logout} className="text-blue-500 hover:underline">
        Logout
      </a>
    </div>
  );
}
