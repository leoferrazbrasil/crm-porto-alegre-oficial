import { describe, expect, it } from "vitest";

import { calculateFunnelMetrics } from "./funnel-metrics";
import type { FunnelEvent } from "./funnel-events";

const period = {
  start: "2026-08-01T00:00:00.000Z",
  end: "2026-09-01T00:00:00.000Z"
};

const events: FunnelEvent[] = [
  event("conversation_status_changed", "conversation-1", null, "qualifying", "2026-08-02T10:00:00.000Z"),
  event("conversation_status_changed", "conversation-1", null, "qualified", "2026-08-02T11:00:00.000Z"),
  event("conversation_lead_linked", "conversation-1", "lead-1", null, "2026-08-02T11:05:00.000Z"),
  event("lead_stage_changed", null, "lead-1", "Negociação", "2026-08-03T10:00:00.000Z"),
  event("lead_stage_changed", null, "lead-1", "Fechado ganho", "2026-08-04T10:00:00.000Z"),
  event("conversation_status_changed", "conversation-2", null, "mistake", "2026-08-03T10:00:00.000Z"),
  event("conversation_status_changed", "conversation-3", null, "qualifying", "2026-08-04T10:00:00.000Z"),
  event("conversation_status_changed", "conversation-3", null, "not_interested", "2026-08-04T11:00:00.000Z")
];

describe("calculateFunnelMetrics", () => {
  it("counts the inbound funnel once per entity and derives its rates", () => {
    const metrics = calculateFunnelMetrics(
      {
        conversations: [
          conversation("conversation-1", "qualified", "lead-1", "2026-08-02T09:00:00.000Z"),
          conversation("conversation-2", "mistake", null, "2026-08-03T09:00:00.000Z"),
          conversation("conversation-3", "not_interested", null, "2026-08-04T09:00:00.000Z"),
          conversation("conversation-old", "qualified", "lead-old", "2026-07-31T09:00:00.000Z")
        ],
        leads: [
          { id: "lead-1", stage: "Fechado ganho" },
          { id: "lead-old", stage: "Negociação" }
        ],
        events,
        messages: []
      },
      period
    );

    expect(metrics).toMatchObject({
      conversationsStarted: 3,
      validContacts: 2,
      qualifyingContacts: 2,
      qualifiedContacts: 1,
      leadsCreated: 1,
      negotiations: 1,
      wonDeals: 1,
      lostDeals: 0,
      rates: {
        validContact: 66.66666666666666,
        qualification: 50,
        leadConversion: 100,
        negotiation: 100,
        win: 100,
        loss: 0,
        final: 33.33333333333333
      }
    });
  });

  it("reports first-response backlog and median response time", () => {
    const metrics = calculateFunnelMetrics(
      {
        conversations: [
          conversation("conversation-1", "new", null, "2026-08-02T09:00:00.000Z"),
          conversation("conversation-2", "new", null, "2026-08-03T09:00:00.000Z")
        ],
        leads: [],
        events: [],
        messages: [
          { conversationId: "conversation-1", direction: "inbound", occurredAt: "2026-08-02T09:00:00.000Z" },
          { conversationId: "conversation-1", direction: "outbound", occurredAt: "2026-08-02T09:30:00.000Z" },
          { conversationId: "conversation-2", direction: "inbound", occurredAt: "2026-08-03T09:00:00.000Z" }
        ]
      },
      period
    );

    expect(metrics.awaitingFirstResponse).toBe(1);
    expect(metrics.medianFirstResponseMinutes).toBe(30);
  });

  it("uses null for rates whose denominator is zero", () => {
    const metrics = calculateFunnelMetrics(
      {
        conversations: [],
        leads: [],
        events: [],
        messages: []
      },
      period
    );

    expect(metrics.rates).toEqual({
      validContact: null,
      qualification: null,
      leadConversion: null,
      negotiation: null,
      win: null,
      loss: null,
      final: null
    });
  });
});

function conversation(
  id: string,
  qualificationStatus: string,
  leadId: string | null,
  createdAt: string
) {
  return { id, qualificationStatus, leadId, createdAt };
}

function event(
  eventType: FunnelEvent["eventType"],
  conversationId: string | null,
  leadId: string | null,
  toValue: string,
  occurredAt: string
): FunnelEvent {
  return {
    id: `${eventType}-${occurredAt}`,
    eventType,
    eventKey: null,
    conversationId,
    leadId,
    fromStatus: null,
    toStatus: eventType === "conversation_status_changed" ? toValue : null,
    fromStage: null,
    toStage: eventType === "lead_stage_changed" ? toValue : null,
    occurredAt
  };
}
