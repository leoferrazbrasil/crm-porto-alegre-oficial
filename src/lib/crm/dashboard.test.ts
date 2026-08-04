import { describe, expect, it } from "vitest";

import { buildDashboardViewModel, formatCurrency } from "./dashboard";
import type { FunnelMetrics } from "./funnel-metrics";
import { mockLeads, mockTasks } from "./mock-data";

describe("formatCurrency", () => {
  it("formata valores comerciais em reais sem casas decimais", () => {
    expect(formatCurrency(22_000)).toBe("R$ 22.000");
  });
});

describe("buildDashboardViewModel", () => {
  it("ordena próximas ações e tarefas abertas por vencimento", () => {
    const dashboard = buildDashboardViewModel(
      mockLeads,
      mockTasks,
      new Date("2026-07-30T15:00:00.000Z")
    );

    expect(dashboard.activeLeads[0]?.id).toBe("lead-006");
    expect(dashboard.openTasks[0]?.id).toBe("task-001");
    expect(dashboard.pipeline).toHaveLength(6);
    expect(dashboard.summary.totalLeads).toBe(10);
  });

  it("exposes the inbound funnel metrics alongside the lead summary", () => {
    const funnelMetrics = {
      conversationsStarted: 12,
      validContacts: 9,
      qualifyingContacts: 6,
      negotiationContacts: 4,
      leadsCreated: 4,
      negotiations: 2,
      wonDeals: 1,
      lostDeals: 1,
      salesClosed: 1,
      revenueGenerated: 22000,
      averageTicket: 22000,
      awaitingFirstResponse: 3,
      medianFirstResponseMinutes: 18,
      rates: {
        validContact: 75,
        qualification: 66.66666666666666,
        leadConversion: 100,
        negotiation: 50,
        win: 50,
        loss: 50,
        final: 8.333333333333332,
        conversationToNegotiation: 16.666666666666664,
        negotiationToSale: 50,
        conversationToSale: 8.333333333333332
      }
    } satisfies FunnelMetrics;

    const dashboard = buildDashboardViewModel(
      mockLeads,
      mockTasks,
      new Date("2026-07-30T15:00:00.000Z"),
      funnelMetrics
    );

    expect(dashboard.funnelMetrics).toEqual(funnelMetrics);
  });
});
