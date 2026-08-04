import { describe, expect, it } from "vitest";

import { buildKanbanColumns } from "./kanban";
import { PIPELINE_STAGES } from "./pipeline";
import { mockLeads } from "./mock-data";

describe("buildKanbanColumns", () => {
  it("preserva todas as etapas oficiais e agrega os leads sem duplicidade", () => {
    const columns = buildKanbanColumns(mockLeads);

    expect(columns.map((column) => column.stage)).toEqual(PIPELINE_STAGES);
    expect(columns).toHaveLength(6);
    expect(columns.find((column) => column.stage === "Negociação")?.leads).toHaveLength(1);
    expect(columns.find((column) => column.stage === "Negociação")?.totalValue).toBe(18_000);
    expect(columns.reduce((total, column) => total + column.leads.length, 0)).toBe(mockLeads.length);
  });
});
