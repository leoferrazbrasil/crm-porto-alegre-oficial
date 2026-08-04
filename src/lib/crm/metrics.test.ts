import { describe, expect, it } from "vitest";

import { calculateCrmSummary, groupLeadsByStage } from "./metrics";
import { PIPELINE_STAGES } from "./pipeline";
import type { Lead } from "./types";

const leads: Lead[] = [
  {
    id: "lead-1",
    companyName: "Restaurante Orla",
    contactName: "Ana",
    segment: "Gastronomia",
    source: "Prospecção ativa",
    stage: "Proposta",
    owner: "Leonardo",
    estimatedValue: 10_000,
    probability: 60,
    nextAction: "Retomar proposta",
    nextActionAt: "2026-07-29T14:00:00.000Z",
    createdAt: "2026-07-20T12:00:00.000Z",
    updatedAt: "2026-07-28T12:00:00.000Z"
  },
  {
    id: "lead-2",
    companyName: "Hotel Centro",
    contactName: "Bruno",
    segment: "Turismo",
    source: "Indicação",
    stage: "Negociação",
    owner: "Leonardo",
    estimatedValue: 20_000,
    probability: 80,
    nextAction: "Validar condições",
    nextActionAt: "2026-08-02T14:00:00.000Z",
    createdAt: "2026-07-18T12:00:00.000Z",
    updatedAt: "2026-07-29T12:00:00.000Z"
  },
  {
    id: "lead-3",
    companyName: "Clínica Sul",
    contactName: "Carla",
    segment: "Saúde",
    source: "Inbound",
    stage: "Ganho",
    owner: "Leonardo",
    estimatedValue: 5_000,
    probability: 100,
    nextAction: "Iniciar entrega",
    nextActionAt: "2026-08-01T14:00:00.000Z",
    createdAt: "2026-07-10T12:00:00.000Z",
    updatedAt: "2026-07-30T12:00:00.000Z"
  },
  {
    id: "lead-4",
    companyName: "Loja Bairro",
    contactName: "Diego",
    segment: "Varejo",
    source: "Prospecção ativa",
    stage: "Perdido",
    owner: "Leonardo",
    estimatedValue: 3_000,
    probability: 0,
    nextAction: "Registrar aprendizado",
    nextActionAt: "2026-07-20T14:00:00.000Z",
    createdAt: "2026-07-08T12:00:00.000Z",
    updatedAt: "2026-07-25T12:00:00.000Z",
    lossReason: "Sem prioridade no momento"
  }
];

describe("calculateCrmSummary", () => {
  it("calcula pipeline, forecast e conversão sem contar negócios encerrados como ativos", () => {
    const summary = calculateCrmSummary(
      leads,
      new Date("2026-07-30T12:00:00.000Z")
    );

    expect(summary).toEqual({
      totalLeads: 4,
      activeOpportunities: 2,
      wonDeals: 1,
      lostDeals: 1,
      proposalsOpen: 2,
      pipelineValue: 30_000,
      weightedForecast: 22_000,
      overdueNextActions: 1,
      conversionRate: 50
    });
  });
});

describe("groupLeadsByStage", () => {
  it("mantém todas as etapas na ordem operacional, inclusive as vazias", () => {
    const groups = groupLeadsByStage(leads);

    expect(groups.map((group) => group.stage)).toEqual(PIPELINE_STAGES);
    expect(
      groups.find((group) => group.stage === "Proposta")?.leads
    ).toHaveLength(1);
    expect(
      groups.find((group) => group.stage === "Novo")?.leads
    ).toHaveLength(0);
  });
});
