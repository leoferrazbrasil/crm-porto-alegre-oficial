import { describe, expect, it } from "vitest";

import { calculateTargetPacing } from "./target-pacing";
import type { FunnelMetrics } from "./funnel-metrics";

const metrics = {
  conversationsStarted: 10,
  validContacts: 8,
  qualifyingContacts: 6,
  qualifiedContacts: 5,
  leadsCreated: 5,
  negotiations: 4,
  wonDeals: 2,
  lostDeals: 1,
  salesClosed: 2,
  revenueGenerated: 12000,
  averageTicket: 6000,
  awaitingFirstResponse: 0,
  medianFirstResponseMinutes: 15,
  rates: {
    validContact: 80,
    qualification: 75,
    leadConversion: 100,
    negotiation: 80,
    win: 50,
    loss: 25,
    final: 20,
    conversationToNegotiation: 40,
    negotiationToSale: 50,
    conversationToSale: 20
  }
} satisfies FunnelMetrics;

describe("calculateTargetPacing", () => {
  it("calcula vendas, conversas e negociações necessárias por dia", () => {
    const pacing = calculateTargetPacing(
      metrics,
      180000,
      { start: "2026-08-01T00:00:00.000Z", end: "2026-09-01T00:00:00.000Z" }
    );

    expect(pacing).toEqual({
      targetRevenue: 180000,
      salesNeeded: 30,
      conversationsNeeded: 150,
      negotiationsNeeded: 60,
      conversationsPerDay: 5,
      negotiationsPerDay: 2
    });
  });

  it("retorna valores nulos quando não há ticket ou taxa observada", () => {
    const pacing = calculateTargetPacing(
      { ...metrics, averageTicket: null, rates: { ...metrics.rates, conversationToSale: null } },
      50000,
      { start: "2026-08-01T00:00:00.000Z", end: "2026-09-01T00:00:00.000Z" }
    );

    expect(pacing.salesNeeded).toBe(null);
    expect(pacing.conversationsNeeded).toBe(null);
    expect(pacing.conversationsPerDay).toBe(null);
    expect(pacing.negotiationsNeeded).toBe(null);
    expect(pacing.negotiationsPerDay).toBe(null);
  });
});
