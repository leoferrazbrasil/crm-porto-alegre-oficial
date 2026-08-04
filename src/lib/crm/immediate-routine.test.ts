import { describe, expect, it } from "vitest";

import { buildImmediateRoutine } from "./immediate-routine";
import type { Lead } from "./types";

const lead = (overrides: Partial<Lead>): Lead => ({
  id: "lead-1",
  companyName: "Empresa A",
  contactName: "Pessoa A",
  segment: "Serviços",
  source: "Inbound",
  stage: "Negociação",
  owner: "Leonardo",
  estimatedValue: 5000,
  probability: 60,
  nextAction: "Responder lead",
  nextActionAt: "2026-08-04T14:00:00.000Z",
  createdAt: "2026-08-01T12:00:00.000Z",
  updatedAt: "2026-08-01T12:00:00.000Z",
  ...overrides
});

describe("buildImmediateRoutine", () => {
  it("inclui todas as ações válidas e ordena as mais próximas primeiro", () => {
    const items = buildImmediateRoutine(
      [
        lead({ id: "later", nextActionAt: "2026-08-08T14:00:00.000Z" }),
        lead({ id: "overdue", nextActionAt: "2026-08-03T14:00:00.000Z" }),
        lead({ id: "soon", nextActionAt: "2026-08-04T14:00:00.000Z" })
      ],
      new Date("2026-08-04T10:00:00.000Z")
    );

    expect(items.map((item) => item.leadId)).toEqual(["overdue", "soon", "later"]);
    expect(items[0]).toMatchObject({ status: "overdue", priority: "Alta" });
    expect(items[1]).toMatchObject({ status: "upcoming", priority: "Alta" });
    expect(items[2]).toMatchObject({ status: "upcoming", priority: "Baixa" });
  });

  it("ignora ação vazia e data inválida", () => {
    const items = buildImmediateRoutine([
      lead({ id: "empty", nextAction: "   " }),
      lead({ id: "invalid", nextActionAt: "data inválida" })
    ]);

    expect(items).toEqual([]);
  });
});
