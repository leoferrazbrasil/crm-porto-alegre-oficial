import { describe, expect, it } from "vitest";

import { resolveSupabaseConfig } from "./client";

describe("resolveSupabaseConfig", () => {
  it("retorna null quando a configuração pública está incompleta", () => {
    expect(
      resolveSupabaseConfig({
        url: "https://example.supabase.co",
        publishableKey: ""
      })
    ).toBeNull();
  });

  it("normaliza a configuração com a chave publicável atual", () => {
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

  it("mantém compatibilidade com a variável anon legada", () => {
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
