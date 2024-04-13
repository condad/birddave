"use client";

import { useState } from "react";
import { getUser } from "./utils";
import { type User } from "./types";
import { useEffect } from "react";

export function User() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUser().then((user) => setUser(user));
  });

  return <div>{user === null ? "Not logged in" : `Logged in as ${user.email}`}</div>;
}
