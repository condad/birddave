import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { idVerifier } from "./app/verifiers";

export async function middleware(request: NextRequest): Promise<NextResponse | void> {
  const cookieStore = cookies();
  const idTokenCookie = cookieStore.get("idToken");
  const signInUrl = process.env.NEXT_PUBLIC_SIGN_IN_URL as string;

  if (!idTokenCookie) {
    return NextResponse.redirect(signInUrl);
  }

  try {
    await idVerifier.verify(idTokenCookie.value);
  } catch {
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: "/upload",
};
