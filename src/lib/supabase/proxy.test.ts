import { describe, expect, it } from "vitest";

import { getAuthRedirect, isAssetPath, isPublicAuthPath } from "./proxy";

describe("auth proxy route decisions", () => {
  it("allows login and password routes without a session", () => {
    expect(isPublicAuthPath("/login")).toBe(true);
    expect(isPublicAuthPath("/auth/callback")).toBe(true);
    expect(isPublicAuthPath("/auth/reset-password")).toBe(true);
    expect(isPublicAuthPath("/auth/update-password")).toBe(true);
  });

  it("ignores framework assets and public images", () => {
    expect(isAssetPath("/_next/static/chunks/app.js")).toBe(true);
    expect(isAssetPath("/logo-porto-alegre-oficial.png")).toBe(true);
  });

  it("redirects unauthenticated CRM requests to login", () => {
    expect(getAuthRedirect("/", false)).toBe("/login");
    expect(getAuthRedirect("/pipeline", false)).toBe("/login");
  });

  it("allows unauthenticated Z-API webhooks to reach their secret validation", () => {
    expect(getAuthRedirect("/api/webhooks/zapi/received/example-secret", false)).toBeNull();
    expect(getAuthRedirect("/api/webhooks/zapi/delivery/example-secret", false)).toBeNull();
  });

  it("redirects authenticated users away from login", () => {
    expect(getAuthRedirect("/login", true)).toBe("/");
  });

  it("does not redirect authenticated CRM requests", () => {
    expect(getAuthRedirect("/", true)).toBeNull();
  });
});
