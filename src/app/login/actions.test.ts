import { describe, expect, it } from "vitest";

import { authenticateWithPassword } from "@/lib/auth/password-flows";

describe("authenticateWithPassword", () => {
  it("rejects empty credentials before calling Supabase", async () => {
    let calls = 0;
    const result = await authenticateWithPassword(
      {
        auth: {
          async signInWithPassword() {
            calls += 1;
            return { error: null };
          }
        }
      },
      "",
      ""
    );

    expect(result).toEqual({
      status: "error",
      message: "Informe e-mail e senha para acessar o CRM."
    });
    expect(calls).toBe(0);
  });

  it("returns a safe message when Supabase rejects the login", async () => {
    const result = await authenticateWithPassword(
      {
        auth: {
          async signInWithPassword() {
            return { error: { message: "Invalid login credentials" } };
          }
        }
      },
      "leonardoferrazbrasil@gmail.com",
      "wrong-password"
    );

    expect(result).toEqual({
      status: "error",
      message: "Não foi possível entrar com esses dados."
    });
  });

  it("accepts valid credentials", async () => {
    const result = await authenticateWithPassword(
      {
        auth: {
          async signInWithPassword() {
            return { error: null };
          }
        }
      },
      " leonardoferrazbrasil@gmail.com ",
      "202122"
    );

    expect(result).toEqual({ status: "success", message: null });
  });
});
