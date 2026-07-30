import { describe, expect, it } from "vitest";

import { requestPasswordReset } from "@/lib/auth/password-flows";

describe("requestPasswordReset", () => {
  it("rejects empty email before calling Supabase", async () => {
    let calls = 0;
    const result = await requestPasswordReset(
      {
        auth: {
          async resetPasswordForEmail() {
            calls += 1;
            return { error: null };
          }
        }
      },
      "",
      "https://crm.example.com"
    );

    expect(result).toEqual({
      status: "error",
      message: "Informe o e-mail administrativo."
    });
    expect(calls).toBe(0);
  });

  it("returns a generic success message after requesting recovery", async () => {
    const result = await requestPasswordReset(
      {
        auth: {
          async resetPasswordForEmail(_email, options) {
            expect(options).toEqual({
              redirectTo: "https://crm.example.com/auth/update-password"
            });
            return { error: null };
          }
        }
      },
      "leonardoferrazbrasil@gmail.com",
      "https://crm.example.com"
    );

    expect(result).toEqual({
      status: "success",
      message: "Se o e-mail estiver autorizado, enviaremos as instruções de acesso."
    });
  });
});
