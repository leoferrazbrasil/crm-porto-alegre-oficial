import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("WhatsAppConnectionPanel", () => {
  it("expõe desconexão administrativa e atualização recorrente do QR Code", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "src/app/integracoes/whatsapp/WhatsAppConnectionPanel.tsx"
      ),
      "utf8"
    );

    expect(source).toContain("Desconectar número");
    expect(source).toContain("/api/zapi/disconnect");
    expect(source).toContain("setQrPollingEnabled");
    expect(source).toContain("setQrCode(null)");
    expect(source).toContain("setInterval");
  });
});
