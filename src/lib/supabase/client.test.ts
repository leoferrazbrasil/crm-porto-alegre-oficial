import { describe, expect, it } from "vitest";

import { resolveSupabaseConfig } from "./client";

describe("resolveSupabaseConfig", () => {
  it("retorna null quando a configuração pública está incompleta", () => {
    expect(
      resolveSupabaseConfig({
        url: "https://example.supabase.co",
        anonKey: ""
      })
    ).toBeNull();
  });

  it("normaliza a configuração quando URL e chave pública existem", () => {
    expect(
      resolveSupabaseConfig({
        url: " https://example.supabase.co/ ",
        anonKey: " public-anon-key "
      })
    ).toEqual({
      url: "https://example.supabase.co",
      anonKey: "public-anon-key"
    });
  });
});
