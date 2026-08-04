import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { CRM_NAV_ITEMS, getCrmNavItemClassName } from "./navigation";

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

  it("marks only the current primary module as active", () => {
    expect(getCrmNavItemClassName("overview", "overview")).toBe(
      "navItem navItemActive"
    );
    expect(getCrmNavItemClassName("leads", "overview")).toBe("navItem");
  });

  it.each([
    ["src/app/page.tsx", 'activeItem="overview"'],
    ["src/app/leads/page.tsx", 'activeItem="leads"'],
    ["src/app/leads/novo/page.tsx", 'activeItem="leads"'],
    ["src/app/leads/[id]/page.tsx", 'activeItem="leads"'],
    ["src/app/conversas/page.tsx", 'activeItem="conversations"'],
    [
      "src/app/integracoes/whatsapp/page.tsx",
      'activeItem="whatsapp"'
    ],
    ["src/app/perfil/page.tsx", 'activeItem="profile"']
  ])("uses the shared sidebar in %s", (relativePath, activeItem) => {
    const source = readFileSync(resolve(process.cwd(), relativePath), "utf8");
    const sidebarBlock = source.match(
      /<aside className="sidebar">[\s\S]*?<\/aside>/
    );

    expect(source).toContain("<CrmSidebar");
    expect(source).toContain(activeItem);
    expect(sidebarBlock).toBeNull();
  });
});
