import {
  PIPELINE_STAGES,
  PROPOSAL_STAGES,
  isClosedStage
} from "./pipeline";
import type { CrmSummary, Lead, PipelineGroup } from "./types";

export function calculateCrmSummary(
  leads: Lead[],
  referenceDate = new Date()
): CrmSummary {
  const activeLeads = leads.filter((lead) => !isClosedStage(lead.stage));
  const wonDeals = leads.filter((lead) => lead.stage === "Ganho").length;
  const lostDeals = leads.filter(
    (lead) => lead.stage === "Perdido"
  ).length;
  const decidedDeals = wonDeals + lostDeals;

  return {
    totalLeads: leads.length,
    activeOpportunities: activeLeads.length,
    wonDeals,
    lostDeals,
    proposalsOpen: activeLeads.filter((lead) =>
      PROPOSAL_STAGES.includes(lead.stage)
    ).length,
    pipelineValue: activeLeads.reduce(
      (total, lead) => total + lead.estimatedValue,
      0
    ),
    weightedForecast: activeLeads.reduce(
      (total, lead) =>
        total + lead.estimatedValue * (lead.probability / 100),
      0
    ),
    overdueNextActions: activeLeads.filter(
      (lead) => new Date(lead.nextActionAt).getTime() < referenceDate.getTime()
    ).length,
    conversionRate:
      decidedDeals === 0 ? 0 : (wonDeals / decidedDeals) * 100
  };
}

export function groupLeadsByStage(leads: Lead[]): PipelineGroup[] {
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

