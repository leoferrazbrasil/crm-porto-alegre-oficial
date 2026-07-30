import { describe, expect, it } from "vitest";

import { requireSupabaseConfig, resolveSupabaseConfig } from "./config";

describe("resolveSupabaseConfig", () => {
  it("returns null when the publishable key is missing", () => {
    expect(
      resolveSupabaseConfig({
        url: "https://example.supabase.co",
        publishableKey: ""
      })
    ).toBeNull();
  });

  it("normalizes the url and publishable key", () => {
    expect(
      resolveSupabaseConfig({
        url: " https://example.supabase.co/ ",
        publishableKey: " sb_publishable_example "
      })
    ).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_example"
    });
  });

  it("keeps compatibility with the legacy anon key variable", () => {
    expect(
      resolveSupabaseConfig({
        url: "https://example.supabase.co",
        anonKey: "legacy-anon-key"
      })
    ).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "legacy-anon-key"
    });
  });
});

describe("requireSupabaseConfig", () => {
  it("throws a clear setup error when public config is incomplete", () => {
    expect(() =>
      requireSupabaseConfig({
        url: "https://example.supabase.co",
        publishableKey: ""
      })
    ).toThrow("Supabase public environment is not configured");
  });
});
