import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthStatus } from "./AuthStatus";
import Link from "next/link";
import { getCurrentUser } from "./utils";

export const metadata: Metadata = {
  title: "Birddave",
  description: "Generated by create next app",
};

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({ children }) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <body className={`${inter.className} container mx-auto 2xl:px-64 xl:px-32`}>
        <header className="text-slate-700 py-3">
          <div className="flex justify-between">
            <Link href="/" className="text-4xl">
              <div className={`${inter.className} font-bold`}>BirdDave</div>
            </Link>

            <Link href="/upload">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Upload</button>
            </Link>
          </div>
        </header>

        <div className="flex justify-end">
          <AuthStatus currentUser={currentUser} />
        </div>

        <main className="my-2 min-h-screen">{children}</main>

        <footer className="py-3 text-center">
          <Link className="text-blue-500 hover:underline" href="https://github.com/condad/birddave">
            I am interested in contributing to this project.
          </Link>
        </footer>
      </body>
    </html>
  );
}
