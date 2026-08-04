import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "src/app/page.tsx"), "utf8");

describe("Visão Geral", () => {
  it("não renderiza os cards legados no topo", () => {
    expect(source).not.toContain('<section className="kpiGrid"');
    expect(source).not.toContain("Oportunidades ativas");
    expect(source).not.toContain("Pipeline aberto");
    expect(source).not.toContain("Forecast ponderado");
    expect(source).not.toContain("Propostas abertas");
    expect(source).not.toContain("Conversão decidida");
    expect(source).not.toContain("Próximas ações vencidas");
  });

  it("deriva a rotina imediata das próximas ações dos leads", () => {
    expect(source).toContain("buildImmediateRoutine");
    expect(source).toContain("routineItems");
    expect(source).toContain("<time dateTime=");
  });
});
