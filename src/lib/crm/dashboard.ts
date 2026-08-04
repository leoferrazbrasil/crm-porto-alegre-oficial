import { calculateCrmSummary, groupLeadsByStage } from "./metrics";
import type { FunnelMetrics } from "./funnel-metrics";
import type { CommercialTask, Lead } from "./types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short"
  }).format(new Date(value));
}

export function buildDashboardViewModel(
  leads: Lead[],
  tasks: CommercialTask[],
  referenceDate = new Date(),
  funnelMetrics?: FunnelMetrics
) {
  return {
    summary: calculateCrmSummary(leads, referenceDate),
    funnelMetrics,
    pipeline: groupLeadsByStage(leads),
    activeLeads: leads
      .filter(
        (lead) =>
          lead.stage !== "Fechado ganho" && lead.stage !== "Fechado perdido"
      )
      .sort(
        (first, second) =>
          new Date(first.nextActionAt).getTime() -
          new Date(second.nextActionAt).getTime()
      ),
    openTasks: tasks
      .filter((task) => !task.completed)
      .sort(
        (first, second) =>
          new Date(first.dueAt).getTime() -
          new Date(second.dueAt).getTime()
      )
  };
}

