import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { requireSupabaseConfig } from "./config";

const PUBLIC_AUTH_PATHS = new Set([
  "/login",
  "/auth/reset-password",
  "/auth/update-password"
]);

const PUBLIC_FILE_PATTERN =
  /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$/i;

export function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.has(pathname);
}

export function isAssetPath(pathname: string): boolean {
  return pathname.startsWith("/_next/") || PUBLIC_FILE_PATTERN.test(pathname);
}

export function getAuthRedirect(
  pathname: string,
  isAuthenticated: boolean
): string | null {
  if (isAssetPath(pathname)) {
    return null;
  }

  if (isAuthenticated && isPublicAuthPath(pathname)) {
    return "/";
  }

  if (!isAuthenticated && !isPublicAuthPath(pathname)) {
    return "/login";
  }

  return null;
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({
    request
  });

  const config = requireSupabaseConfig({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({
          request
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const { data } = await supabase.auth.getClaims();
  const redirectPath = getAuthRedirect(
    request.nextUrl.pathname,
    Boolean(data?.claims)
  );

  if (!redirectPath) {
    return response;
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = redirectPath;
  redirectUrl.search = "";

  return NextResponse.redirect(redirectUrl);
}
