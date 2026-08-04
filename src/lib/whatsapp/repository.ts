import type { SupabaseClient } from "@supabase/supabase-js";

import type { ZapiChat } from "@/lib/zapi/client";
import type { NormalizedDelivery, NormalizedReceivedMessage } from "./messages";

const MESSAGE_SELECT = [
  "id",
  "provider_message_id",
  "phone",
  "direction",
  "message_type",
  "body",
  "status",
  "occurred_at",
  "created_by",
  "created_at"
].join(", ");

export type WhatsappRepositoryClient = SupabaseClient;

export interface PersistedWhatsappMessage extends NormalizedReceivedMessage {
  createdBy: string | null;
}

export interface WhatsappMessage {
  id: string;
  providerMessageId: string;
  phone: string;
  direction: "inbound" | "outbound";
  messageType: "text";
  body: string;
  status: string | null;
  occurredAt: string;
  createdBy: string | null;
  createdAt: string;
}

export const WHATSAPP_QUALIFICATION_STATUSES = [
  "new",
  "qualifying",
  "qualified",
  "not_interested",
  "mistake",
  "spam"
] as const;

export type WhatsappQualificationStatus =
  (typeof WHATSAPP_QUALIFICATION_STATUSES)[number];

export interface WhatsappConversation {
  id: string;
  instanceId: string;
  phone: string;
  name: string | null;
  isGroup: boolean;
  leadId: string | null;
  sourceChannel: string;
  sourceDetail: string | null;
  campaign: string | null;
  clickId: string | null;
  qualificationStatus: WhatsappQualificationStatus;
  lastMessageAt: string | null;
}

export type WhatsappConversationMutationResult =
  | { ok: true; qualificationStatus: WhatsappQualificationStatus }
  | { ok: false; message: string };

export async function upsertConversationAndMessage(
  client: WhatsappRepositoryClient,
  message: PersistedWhatsappMessage
): Promise<{ ok: true; conversationId: string } | { ok: false; message: string }> {
  const conversationPayload: Record<string, unknown> = {
    instance_id: message.instanceId,
    phone: message.phone,
    name: message.name,
    is_group: message.isGroup,
    last_message_at: message.occurredAt,
    source_channel: "WhatsApp inbound"
  };

  if (message.attribution) {
    conversationPayload.source_detail = message.attribution.source;
    conversationPayload.campaign = message.attribution.campaign;
    conversationPayload.click_id = message.attribution.gclid;
  }

  const { data: conversation, error: conversationError } = await client
    .from("whatsapp_conversations")
    .upsert(
      conversationPayload,
      { onConflict: "instance_id,phone" }
    )
    .select("id")
    .single();

  if (conversationError || !conversation?.id) {
    return { ok: false, message: "Não foi possível salvar a conversa." };
  }

  const { error: messageError } = await client
    .from("whatsapp_messages")
    .upsert(
      {
        conversation_id: conversation.id,
        instance_id: message.instanceId,
        provider_message_id: message.providerMessageId,
        phone: message.phone,
        direction: message.direction,
        message_type: message.messageType,
        body: message.body,
        status: message.status,
        occurred_at: message.occurredAt,
        created_by: message.createdBy
      },
      {
        onConflict: "instance_id,provider_message_id",
        ignoreDuplicates: true
      }
    );

  if (messageError) {
    return { ok: false, message: "Não foi possível salvar a mensagem." };
  }

  return { ok: true, conversationId: conversation.id };
}

export async function updateMessageDelivery(
  client: WhatsappRepositoryClient,
  delivery: NormalizedDelivery
): Promise<{ ok: boolean; updated: boolean }> {
  const { data, error } = await client
    .from("whatsapp_messages")
    .update({
      status: delivery.status,
      occurred_at: delivery.occurredAt
    })
    .eq("instance_id", delivery.instanceId)
    .eq("provider_message_id", delivery.providerMessageId)
    .eq("phone", delivery.phone)
    .select("id")
    .maybeSingle();

  return {
    ok: !error,
    updated: !error && Boolean(data?.id)
  };
}

export async function updateConversationQualificationStatus(
  client: WhatsappRepositoryClient,
  instanceId: string,
  phone: string,
  status: WhatsappQualificationStatus
): Promise<WhatsappConversationMutationResult> {
  const { data, error } = await client
    .from("whatsapp_conversations")
    .update({ qualification_status: status })
    .eq("instance_id", instanceId)
    .eq("phone", phone)
    .select("id, qualification_status")
    .maybeSingle();

  if (error || !data?.id || !isWhatsappQualificationStatus(data.qualification_status)) {
    return {
      ok: false,
      message: "Não foi possível atualizar o estado da conversa."
    };
  }

  return {
    ok: true,
    qualificationStatus: data.qualification_status
  };
}

export async function listConversationMessages(
  client: WhatsappRepositoryClient,
  instanceId: string,
  phone: string
): Promise<WhatsappMessage[]> {
  const { data: conversation, error: conversationError } = await client
    .from("whatsapp_conversations")
    .select("id")
    .eq("instance_id", instanceId)
    .eq("phone", phone)
    .maybeSingle();

  if (conversationError || !conversation?.id) {
    return [];
  }

  const { data, error } = await client
    .from("whatsapp_messages")
    .select(MESSAGE_SELECT)
    .eq("conversation_id", conversation.id)
    .order("occurred_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as unknown as Record<string, unknown>[]).map(mapMessageRow);
}

export async function getConversation(
  client: WhatsappRepositoryClient,
  instanceId: string,
  phone: string
): Promise<WhatsappConversation | null> {
  const { data, error } = await client
    .from("whatsapp_conversations")
    .select(
      "id, instance_id, phone, name, is_group, lead_id, source_channel, source_detail, campaign, click_id, qualification_status, last_message_at"
    )
    .eq("instance_id", instanceId)
    .eq("phone", phone)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as Record<string, unknown>;
  return {
    id: stringValue(row.id),
    instanceId: stringValue(row.instance_id),
    phone: stringValue(row.phone),
    name: stringValue(row.name) || null,
    isGroup: row.is_group === true,
    leadId: stringValue(row.lead_id) || null,
    sourceChannel: stringValue(row.source_channel) || "WhatsApp inbound",
    sourceDetail: stringValue(row.source_detail) || null,
    campaign: stringValue(row.campaign) || null,
    clickId: stringValue(row.click_id) || null,
    qualificationStatus: isWhatsappQualificationStatus(row.qualification_status)
      ? row.qualification_status
      : "new",
    lastMessageAt: stringValue(row.last_message_at) || null
  };
}

export function isSelectedChatPhone(chats: ZapiChat[], phone: string): boolean {
  return Boolean(phone.trim()) && chats.some((chat) => chat.phone === phone);
}

function mapMessageRow(row: Record<string, unknown>): WhatsappMessage {
  return {
    id: stringValue(row.id),
    providerMessageId: stringValue(row.provider_message_id),
    phone: stringValue(row.phone),
    direction: row.direction === "outbound" ? "outbound" : "inbound",
    messageType: "text",
    body: stringValue(row.body),
    status: stringValue(row.status) || null,
    occurredAt: stringValue(row.occurred_at),
    createdBy: stringValue(row.created_by) || null,
    createdAt: stringValue(row.created_at)
  };
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isWhatsappQualificationStatus(
  value: unknown
): value is WhatsappQualificationStatus {
  return WHATSAPP_QUALIFICATION_STATUSES.includes(
    value as WhatsappQualificationStatus
  );
}
