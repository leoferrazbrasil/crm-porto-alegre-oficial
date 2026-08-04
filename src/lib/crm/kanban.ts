import { PIPELINE_STAGES, type PipelineStage } from "./pipeline";
import type { Lead } from "./types";

export interface KanbanColumn {
  stage: PipelineStage;
  leads: Lead[];
  totalValue: number;
}

export function buildKanbanColumns(leads: Lead[]): KanbanColumn[] {
  return PIPELINE_STAGES.map((stage) => {
    const stageLeads = leads.filter((lead) => lead.stage === stage);
    return {
      stage,
      leads: stageLeads,
      totalValue: stageLeads.reduce(
        (total, lead) => total + lead.estimatedValue,
        0
      )
    };
  });
}
