import type { EmailOtpType } from "@supabase/supabase-js";

export interface AuthCallbackParams {
  code: string | null;
  tokenHash: string | null;
  type: string | null;
  next: string | null;
}

export interface AuthCallbackResult {
  status: "success" | "error";
  nextPath: string;
}

interface AuthCallbackClient {
  auth: {
    exchangeCodeForSession(code: string): Promise<{
      error: { message: string } | null;
    }>;
    verifyOtp(payload: {
      token_hash: string;
      type: EmailOtpType;
    }): Promise<{ error: { message: string } | null }>;
  };
}

const DEFAULT_NEXT_PATH = "/";
const UPDATE_PASSWORD_PATH = "/auth/update-password";

export function buildPasswordRecoveryRedirect(origin: string): string {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", UPDATE_PASSWORD_PATH);
  return url.toString();
}

export function getSafeAuthNextPath(next: string | null): string {
  if (!next?.startsWith("/") || next.startsWith("//")) {
    return DEFAULT_NEXT_PATH;
  }

  return next;
}

export async function exchangeAuthCallback(
  client: AuthCallbackClient,
  params: AuthCallbackParams
): Promise<AuthCallbackResult> {
  const nextPath = getSafeAuthNextPath(params.next);

  if (params.code) {
    const { error } = await client.auth.exchangeCodeForSession(params.code);

    return error
      ? { status: "error", nextPath: "/login" }
      : { status: "success", nextPath };
  }

  if (params.tokenHash && params.type) {
    const { error } = await client.auth.verifyOtp({
      token_hash: params.tokenHash,
      type: params.type as EmailOtpType
    });

    return error
      ? { status: "error", nextPath: "/login" }
      : { status: "success", nextPath };
  }

  return { status: "error", nextPath: "/login" };
}
