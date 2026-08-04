import { describe, expect, it } from "vitest";

import { CRM_NAV_ITEMS } from "./navigation";

describe("CRM sidebar navigation", () => {
  it("exposes only the five primary modules", () => {
    expect(CRM_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Visão Geral",
      "Leads",
      "Conversas",
      "WhatsApp",
      "Perfil"
    ]);
  });

  it("does not expose dashboard sections as sidebar items", () => {
    const labels = CRM_NAV_ITEMS.map((item) => item.label);

    expect(labels).not.toEqual(
      expect.arrayContaining([
        "Pipeline",
        "Oportunidades",
        "Rotina comercial",
        "Metas"
      ])
    );
  });
});
