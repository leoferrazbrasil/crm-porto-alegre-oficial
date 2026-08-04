export const FUNNEL_EVENT_TYPES = [
  "conversation_created",
  "conversation_status_changed",
  "conversation_lead_linked",
  "lead_created",
  "lead_stage_changed"
] as const;

export type FunnelEventType = (typeof FUNNEL_EVENT_TYPES)[number];

export interface FunnelEvent {
  id: string;
  eventType: FunnelEventType;
  eventKey: string | null;
  conversationId: string | null;
  leadId: string | null;
  fromStatus: string | null;
  toStatus: string | null;
  fromStage: string | null;
  toStage: string | null;
  occurredAt: string;
}

export function isFunnelEventType(value: unknown): value is FunnelEventType {
  return FUNNEL_EVENT_TYPES.includes(value as FunnelEventType);
}

export function buildEventKey(
  eventType: FunnelEventType,
  entityId: string
): string | null {
  if (eventType === "conversation_created") {
    return `conversation:${entityId}:created`;
  }

  if (eventType === "lead_created") {
    return `lead:${entityId}:created`;
  }

  return null;
}
