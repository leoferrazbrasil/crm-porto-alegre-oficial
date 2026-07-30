import { describe, expect, it } from "vitest";

import { buildDashboardViewModel, formatCurrency } from "./dashboard";
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
    expect(dashboard.pipeline).toHaveLength(10);
    expect(dashboard.summary.totalLeads).toBe(10);
  });
});
