"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthStatus } from "./AuthStatus";
import { useState } from "react";
import { User } from "./types";
import Link from "next/link";
import { CurrentUserContext } from "./context";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  return (
    <html lang="en" className="w-full">
      <body className={`${inter.className} w-full min-h-screen max-w-screen overflow-x-hidden`}>
        <header className="text-slate-700 w-full flex justify-center py-3 px-4">
          <div className="container mx-auto flex flex-row justify-between items-center">
            <Link href="/" className="text-5xl">
              BirdDave 🦜
            </Link>

            <AuthStatus currentUser={currentUser} />

            <Link href="/upload">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Upload</button>
            </Link>
          </div>
        </header>

        <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
          <main className="my-10 w-full px-4 min-h-screen">{children}</main>
        </CurrentUserContext.Provider>

        <footer className="py-3 text-center">The end</footer>
      </body>
    </html>
  );
}
