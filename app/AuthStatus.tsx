"use client";

import { useState } from "react";
import { type User } from "./types";
import { useEffect } from "react";

export function AuthStatus({ currentUser }: { currentUser: User | null }) {
  return <div>{currentUser === null ? "Not logged in" : `Logged in as ${currentUser.email}`}</div>;
}
