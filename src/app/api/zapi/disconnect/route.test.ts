import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("POST /api/zapi/disconnect", () => {
  it("protege a desconexão e delega para o cliente Z-API", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/app/api/zapi/disconnect/route.ts"),
      "utf8"
    );

    expect(source).toContain("requireCurrentAdmin");
    expect(source).toContain("createZapiClient");
    expect(source).toContain("client.disconnect()");
    expect(source).toContain("export async function POST");
  });
});
