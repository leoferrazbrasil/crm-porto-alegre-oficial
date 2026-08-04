import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("POST /auth/sign-out", () => {
  it("redireciona de forma relativa para não expor o host interno", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/app/auth/sign-out/route.ts"),
      "utf8"
    );

    expect(source).toContain('Location: "/login"');
    expect(source).not.toContain("new URL(\"/login\", request.url)");
  });
});
