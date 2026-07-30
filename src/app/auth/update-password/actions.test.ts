import { describe, expect, it } from "vitest";

import { changePassword } from "@/lib/auth/password-flows";

describe("changePassword", () => {
  it("rejects short passwords before calling Supabase", async () => {
    let calls = 0;
    const result = await changePassword(
      {
        auth: {
          async updateUser() {
            calls += 1;
            return { error: null };
          }
        }
      },
      "12345"
    );

    expect(result).toEqual({
      status: "error",
      message: "A nova senha precisa ter pelo menos 6 caracteres."
    });
    expect(calls).toBe(0);
  });

  it("updates the password through Supabase", async () => {
    const result = await changePassword(
      {
        auth: {
          async updateUser(payload) {
            expect(payload).toEqual({ password: "202122" });
            return { error: null };
          }
        }
      },
      "202122"
    );

    expect(result).toEqual({
      status: "success",
      message: "Senha atualizada com sucesso."
    });
  });
});
