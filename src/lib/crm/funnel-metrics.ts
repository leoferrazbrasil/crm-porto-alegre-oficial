import type { FunnelEvent } from "./funnel-events";

export interface FunnelMetricPeriod {
  start: string;
  end: string;
}

export interface FunnelConversationSnapshot {
  id: string;
  qualificationStatus: string;
  leadId: string | null;
  createdAt: string;
}

export interface FunnelLeadSnapshot {
  id: string;
  stage: string;
  estimatedValue?: number;
}

export interface FunnelMessageSnapshot {
  conversationId: string;
  direction: "inbound" | "outbound";
  occurredAt: string;
}

export interface FunnelMetricsInput {
  conversations: FunnelConversationSnapshot[];
  leads: FunnelLeadSnapshot[];
  events: FunnelEvent[];
  messages: FunnelMessageSnapshot[];
}

export interface FunnelMetricRates {
  validContact: number | null;
  qualification: number | null;
  leadConversion: number | null;
  negotiation: number | null;
  win: number | null;
  loss: number | null;
  final: number | null;
  conversationToNegotiation: number | null;
  negotiationToSale: number | null;
  conversationToSale: number | null;
}

export interface FunnelMetrics {
  conversationsStarted: number;
  validContacts: number;
  qualifyingContacts: number;
  negotiationContacts: number;
  leadsCreated: number;
  negotiations: number;
  wonDeals: number;
  lostDeals: number;
  salesClosed: number;
  revenueGenerated: number;
  averageTicket: number | null;
  awaitingFirstResponse: number;
  medianFirstResponseMinutes: number | null;
  rates: FunnelMetricRates;
}

const VALID_CONTACT_STATUSES = new Set([
  "new",
  "qualifying",
  "negotiation",
  "proposal",
  "won",
  "lost"
]);

export function calculateFunnelMetrics(
  input: FunnelMetricsInput,
  period: FunnelMetricPeriod
): FunnelMetrics {
  const cohortConversations = input.conversations.filter((conversation) =>
    isWithinPeriod(conversation.createdAt, period)
  );
  const cohortIds = new Set(cohortConversations.map((conversation) => conversation.id));
  const eventsByConversation = groupEventsByConversation(input.events);
  const linkedLeadIds = new Set<string>();
  let validContacts = 0;
  let qualifyingContacts = 0;
  let negotiationContacts = 0;

  for (const conversation of cohortConversations) {
    const conversationEvents = eventsByConversation.get(conversation.id) ?? [];
    const statuses = new Set<string>([conversation.qualificationStatus]);

    for (const event of conversationEvents) {
      if (event.toStatus) statuses.add(event.toStatus);
      if (event.eventType === "conversation_lead_linked" && event.leadId) {
        linkedLeadIds.add(event.leadId);
      }
    }

    if ([...statuses].some((status) => VALID_CONTACT_STATUSES.has(status))) {
      validContacts += 1;
    }
    if (statuses.has("qualifying")) qualifyingContacts += 1;
    if (["negotiation", "proposal", "won"].some((status) => statuses.has(status))) {
      negotiationContacts += 1;
    }
    if (conversation.leadId) linkedLeadIds.add(conversation.leadId);
  }

  const leadsById = new Map(input.leads.map((lead) => [lead.id, lead]));
  const leadStageEvents = groupEventsByLead(input.events);
  let negotiations = 0;
  let wonDeals = 0;
  let lostDeals = 0;
  let revenueGenerated = 0;

  for (const leadId of linkedLeadIds) {
    const lead = leadsById.get(leadId);
    const stages = new Set<string>(lead ? [lead.stage] : []);
    for (const event of leadStageEvents.get(leadId) ?? []) {
      if (event.toStage) stages.add(event.toStage);
    }

    if (stages.has("Negociação")) negotiations += 1;
    if (stages.has("Ganho")) {
      wonDeals += 1;
      revenueGenerated += lead?.estimatedValue ?? 0;
    }
    if (stages.has("Perdido")) lostDeals += 1;
  }

  const responseStats = calculateFirstResponseStats(
    input.messages.filter((message) => cohortIds.has(message.conversationId))
  );

  return {
    conversationsStarted: cohortConversations.length,
    validContacts,
    qualifyingContacts,
    negotiationContacts,
    leadsCreated: linkedLeadIds.size,
    negotiations,
    wonDeals,
    lostDeals,
    salesClosed: wonDeals,
    revenueGenerated,
    averageTicket: wonDeals === 0 ? null : revenueGenerated / wonDeals,
    awaitingFirstResponse: responseStats.awaitingFirstResponse,
    medianFirstResponseMinutes: responseStats.medianFirstResponseMinutes,
    rates: {
      validContact: percentage(validContacts, cohortConversations.length),
      qualification: percentage(negotiationContacts, validContacts),
      leadConversion: percentage(linkedLeadIds.size, negotiationContacts),
      negotiation: percentage(negotiations, linkedLeadIds.size),
      win: percentage(wonDeals, negotiations),
      loss: percentage(lostDeals, negotiations),
      final: percentage(wonDeals, cohortConversations.length),
      conversationToNegotiation: percentage(negotiations, cohortConversations.length),
      negotiationToSale: percentage(wonDeals, negotiations),
      conversationToSale: percentage(wonDeals, cohortConversations.length)
    }
  };
}

function isWithinPeriod(value: string, period: FunnelMetricPeriod): boolean {
  const timestamp = new Date(value).getTime();
  const start = new Date(period.start).getTime();
  const end = new Date(period.end).getTime();
  return Number.isFinite(timestamp) && timestamp >= start && timestamp < end;
}

function groupEventsByConversation(events: FunnelEvent[]) {
  const grouped = new Map<string, FunnelEvent[]>();
  for (const event of events) {
    if (!event.conversationId) continue;
    const list = grouped.get(event.conversationId) ?? [];
    list.push(event);
    grouped.set(event.conversationId, list);
  }
  return grouped;
}

function groupEventsByLead(events: FunnelEvent[]) {
  const grouped = new Map<string, FunnelEvent[]>();
  for (const event of events) {
    if (!event.leadId) continue;
    const list = grouped.get(event.leadId) ?? [];
    list.push(event);
    grouped.set(event.leadId, list);
  }
  return grouped;
}

function percentage(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : (numerator / denominator) * 100;
}

function calculateFirstResponseStats(messages: FunnelMessageSnapshot[]) {
  const messagesByConversation = new Map<string, FunnelMessageSnapshot[]>();
  for (const message of messages) {
    const list = messagesByConversation.get(message.conversationId) ?? [];
    list.push(message);
    messagesByConversation.set(message.conversationId, list);
  }

  const responseMinutes: number[] = [];
  let awaitingFirstResponse = 0;

  for (const conversationMessages of messagesByConversation.values()) {
    const inbound = earliestMessage(conversationMessages, "inbound");
    if (!inbound) continue;
    const outbound = conversationMessages
      .filter((message) => message.direction === "outbound")
      .filter((message) => new Date(message.occurredAt).getTime() >= new Date(inbound.occurredAt).getTime())
      .sort((first, second) => new Date(first.occurredAt).getTime() - new Date(second.occurredAt).getTime())[0];

    if (!outbound) {
      awaitingFirstResponse += 1;
      continue;
    }

    responseMinutes.push(
      (new Date(outbound.occurredAt).getTime() - new Date(inbound.occurredAt).getTime()) /
        60_000
    );
  }

  responseMinutes.sort((first, second) => first - second);
  const middle = Math.floor(responseMinutes.length / 2);
  const medianFirstResponseMinutes = responseMinutes.length
    ? responseMinutes.length % 2
      ? responseMinutes[middle]
      : (responseMinutes[middle - 1] + responseMinutes[middle]) / 2
    : null;

  return { awaitingFirstResponse, medianFirstResponseMinutes };
}

function earliestMessage(
  messages: FunnelMessageSnapshot[],
  direction: FunnelMessageSnapshot["direction"]
) {
  return messages
    .filter((message) => message.direction === direction)
    .sort((first, second) => new Date(first.occurredAt).getTime() - new Date(second.occurredAt).getTime())[0];
}
