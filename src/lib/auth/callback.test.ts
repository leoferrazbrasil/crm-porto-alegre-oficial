import { describe, expect, it } from "vitest";

import {
  buildPasswordRecoveryRedirect,
  exchangeAuthCallback,
  getSafeAuthNextPath
} from "./callback";

describe("buildPasswordRecoveryRedirect", () => {
  it("routes password recovery links through the server callback", () => {
    expect(buildPasswordRecoveryRedirect("https://crm.example.com")).toBe(
      "https://crm.example.com/auth/callback?next=%2Fauth%2Fupdate-password"
    );
  });
});

describe("getSafeAuthNextPath", () => {
  it("keeps internal paths and rejects external redirects", () => {
    expect(getSafeAuthNextPath("/auth/update-password")).toBe(
      "/auth/update-password"
    );
    expect(getSafeAuthNextPath("https://evil.example.com")).toBe("/");
    expect(getSafeAuthNextPath("//evil.example.com")).toBe("/");
  });
});

describe("exchangeAuthCallback", () => {
  it("exchanges a PKCE code for a server-side session", async () => {
    let exchangedCode = "";

    const result = await exchangeAuthCallback(
      {
        auth: {
          async exchangeCodeForSession(code) {
            exchangedCode = code;
            return { error: null };
          },
          async verifyOtp() {
            return { error: { message: "not used" } };
          }
        }
      },
      {
        code: "pkce-code",
        tokenHash: null,
        type: null,
        next: "/auth/update-password"
      }
    );

    expect(exchangedCode).toBe("pkce-code");
    expect(result).toEqual({
      status: "success",
      nextPath: "/auth/update-password"
    });
  });

  it("verifies token_hash links from custom Supabase email templates", async () => {
    const result = await exchangeAuthCallback(
      {
        auth: {
          async exchangeCodeForSession() {
            return { error: { message: "not used" } };
          },
          async verifyOtp(payload) {
            expect(payload).toEqual({
              token_hash: "hashed-token",
              type: "recovery"
            });
            return { error: null };
          }
        }
      },
      {
        code: null,
        tokenHash: "hashed-token",
        type: "recovery",
        next: "/auth/update-password"
      }
    );

    expect(result).toEqual({
      status: "success",
      nextPath: "/auth/update-password"
    });
  });

  it("returns an error result when the callback has no usable token", async () => {
    const result = await exchangeAuthCallback(
      {
        auth: {
          async exchangeCodeForSession() {
            return { error: null };
          },
          async verifyOtp() {
            return { error: null };
          }
        }
      },
      {
        code: null,
        tokenHash: null,
        type: null,
        next: "/auth/update-password"
      }
    );

    expect(result).toEqual({
      status: "error",
      nextPath: "/login"
    });
  });
});
