import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isFunnelEventType,
  type FunnelEvent
} from "./funnel-events";
import {
  calculateFunnelMetrics,
  type FunnelMetricPeriod,
  type FunnelMetrics
} from "./funnel-metrics";

export async function getFunnelMetrics(
  client: SupabaseClient,
  period: FunnelMetricPeriod
): Promise<FunnelMetrics> {
  const [conversationsResult, leadsResult, eventsResult, messagesResult] =
    await Promise.all([
      client
        .from("whatsapp_conversations")
        .select("id, qualification_status, lead_id, created_at"),
      client.from("leads").select("id, stage"),
      client
        .from("crm_funnel_events")
        .select(
          "id, event_type, event_key, conversation_id, lead_id, from_status, to_status, from_stage, to_stage, occurred_at"
        ),
      client
        .from("whatsapp_messages")
        .select("conversation_id, direction, occurred_at")
    ]);

  return calculateFunnelMetrics(
    {
      conversations: conversationsResult.error
        ? []
        : (conversationsResult.data ?? []).map((row) => ({
            id: stringValue(row.id),
            qualificationStatus: stringValue(row.qualification_status) || "new",
            leadId: stringValue(row.lead_id) || null,
            createdAt: stringValue(row.created_at)
          })),
      leads: leadsResult.error
        ? []
        : (leadsResult.data ?? []).map((row) => ({
            id: stringValue(row.id),
            stage: stringValue(row.stage)
          })),
      events: eventsResult.error
        ? []
        : (eventsResult.data ?? []).flatMap((row) => mapEvent(row)),
      messages: messagesResult.error
        ? []
        : (messagesResult.data ?? []).flatMap((row) => {
            const direction = row.direction === "outbound" ? "outbound" : row.direction === "inbound" ? "inbound" : null;
            return direction
              ? [{
                  conversationId: stringValue(row.conversation_id),
                  direction,
                  occurredAt: stringValue(row.occurred_at)
                }]
              : [];
          })
    },
    period
  );
}

function mapEvent(row: Record<string, unknown>): FunnelEvent[] {
  const eventType = row.event_type;
  if (!isFunnelEventType(eventType)) return [];

  return [
    {
      id: stringValue(row.id),
      eventType,
      eventKey: stringValue(row.event_key) || null,
      conversationId: stringValue(row.conversation_id) || null,
      leadId: stringValue(row.lead_id) || null,
      fromStatus: stringValue(row.from_status) || null,
      toStatus: stringValue(row.to_status) || null,
      fromStage: stringValue(row.from_stage) || null,
      toStage: stringValue(row.to_stage) || null,
      occurredAt: stringValue(row.occurred_at)
    }
  ];
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}
