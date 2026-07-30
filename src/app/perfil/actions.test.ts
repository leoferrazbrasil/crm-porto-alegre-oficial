import { describe, expect, it } from "vitest";

import { updateProfilePassword } from "./actions";

describe("updateProfilePassword", () => {
  it("rejects short passwords before calling Supabase", async () => {
    let calls = 0;

    const result = await updateProfilePassword(
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

  it("updates the logged user's password without redirecting", async () => {
    const result = await updateProfilePassword(
      {
        auth: {
          async updateUser(payload) {
            expect(payload).toEqual({ password: "nova-senha" });
            return { error: null };
          }
        }
      },
      "nova-senha"
    );

    expect(result).toEqual({
      status: "success",
      message: "Senha atualizada com sucesso."
    });
  });
});
