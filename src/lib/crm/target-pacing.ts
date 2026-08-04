import type { FunnelMetricPeriod, FunnelMetrics } from "./funnel-metrics";

export interface TargetPacing {
  targetRevenue: number;
  salesNeeded: number | null;
  conversationsNeeded: number | null;
  negotiationsNeeded: number | null;
  conversationsPerDay: number | null;
  negotiationsPerDay: number | null;
}

export function calculateTargetPacing(
  metrics: FunnelMetrics,
  targetRevenue: number,
  period: FunnelMetricPeriod
): TargetPacing {
  const normalizedTarget = Math.max(0, Number.isFinite(targetRevenue) ? targetRevenue : 0);
  const salesNeeded =
    normalizedTarget === 0
      ? 0
      : metrics.averageTicket && metrics.averageTicket > 0
        ? Math.ceil(normalizedTarget / metrics.averageTicket)
        : null;
  const conversationsNeeded = divideByRate(salesNeeded, metrics.rates.conversationToSale);
  const negotiationsNeeded = divideByRate(salesNeeded, metrics.rates.negotiationToSale);
  const daysInPeriod = countCalendarDays(period);

  return {
    targetRevenue: normalizedTarget,
    salesNeeded,
    conversationsNeeded,
    negotiationsNeeded,
    conversationsPerDay: perDay(conversationsNeeded, daysInPeriod),
    negotiationsPerDay: perDay(negotiationsNeeded, daysInPeriod)
  };
}

function divideByRate(value: number | null, rate: number | null): number | null {
  if (value === null || value === 0) return value;
  if (rate === null || rate <= 0) return null;
  return Math.ceil(value / (rate / 100));
}

function perDay(value: number | null, days: number): number | null {
  if (value === null) return null;
  return Math.ceil(value / days);
}

function countCalendarDays(period: FunnelMetricPeriod): number {
  const start = new Date(period.start);
  const end = new Date(period.end);
  const millisecondsPerDay = 86_400_000;
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / millisecondsPerDay));
}
