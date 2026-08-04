import type { SupabaseClient } from "@supabase/supabase-js";

import type { LeadPayload } from "@/lib/crm/leads";
import {
  getConversation,
  WHATSAPP_QUALIFICATION_STATUSES,
  type WhatsappConversation,
  type WhatsappQualificationStatus
} from "./repository";

export interface QualifiedConversation {
  id: string;
  phone: string;
  name: string | null;
  leadId: string | null;
  qualificationStatus: WhatsappQualificationStatus;
}

export interface LeadConversionInput {
  companyName: string;
  segment: string;
}

const QUALIFICATION_STATUS_LABELS: Record<
  WhatsappQualificationStatus,
  string
> = {
  new: "Novo",
  qualifying: "Qualificando",
  negotiation: "Negociação",
  proposal: "Proposta",
  won: "Ganho",
  lost: "Perdido"
};

export function qualificationStatusLabel(
  status: WhatsappQualificationStatus
): string {
  return QUALIFICATION_STATUS_LABELS[status];
}

export function canConvertConversation(
  conversation: QualifiedConversation
): boolean {
  return conversation.qualificationStatus === "negotiation" && !conversation.leadId;
}

export type LeadConversionValidation =
  | { ok: true }
  | { ok: false; message: string };

export function parseQualificationStatus(
  value: unknown
): WhatsappQualificationStatus | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();

  return WHATSAPP_QUALIFICATION_STATUSES.includes(
    normalized as WhatsappQualificationStatus
  )
    ? (normalized as WhatsappQualificationStatus)
    : null;
}

export function validateLeadConversion(
  conversation: QualifiedConversation,
  input: LeadConversionInput
): LeadConversionValidation {
  if (conversation.qualificationStatus !== "negotiation") {
    return {
      ok: false,
      message: "A conversa precisa estar marcada como Negociação."
    };
  }

  if (conversation.leadId) {
    return {
      ok: false,
      message: "Esta conversa já está vinculada a um lead."
    };
  }

  if (!input.companyName.trim() || !input.segment.trim()) {
    return {
      ok: false,
      message: "Informe a empresa e o segmento antes de converter."
    };
  }

  return { ok: true };
}

export function buildLeadPayloadFromConversation(
  conversation: QualifiedConversation,
  input: LeadConversionInput,
  ownerId: string,
  nextActionAt: string
): LeadPayload {
  return {
    company_name: input.companyName.trim(),
    contact_name: conversation.name?.trim() || conversation.phone,
    segment: input.segment.trim(),
    source: "Inbound",
    instagram_profile: null,
    stage: "Negociação",
    owner_id: ownerId,
    estimated_value: 0,
    recurring_value: null,
    probability: 0,
    next_action: "Realizar diagnóstico comercial",
    next_action_at: nextActionAt,
    loss_reason: null
  };
}

export interface LeadConversionResult {
  ok: boolean;
  leadId?: string;
  message?: string;
}

export async function createLeadFromQualifiedConversation(
  client: SupabaseClient,
  instanceId: string,
  phone: string,
  ownerId: string,
  input: LeadConversionInput,
  now: string = new Date().toISOString()
): Promise<LeadConversionResult> {
  const persistedConversation = await getConversation(client, instanceId, phone);

  if (!persistedConversation) {
    return { ok: false, message: "Conversa não encontrada." };
  }

  const conversation = toQualifiedConversation(persistedConversation);
  const validation = validateLeadConversion(conversation, input);

  if (!validation.ok) return validation;

  const { data: lead, error: leadError } = await client
    .from("leads")
    .insert(buildLeadPayloadFromConversation(conversation, input, ownerId, now))
    .select("id")
    .single();

  if (leadError || !lead?.id) {
    return { ok: false, message: "Não foi possível criar o lead." };
  }

  const { error: linkError } = await client
    .from("whatsapp_conversations")
    .update({ lead_id: lead.id })
    .eq("id", conversation.id);

  if (linkError) {
    await client.from("leads").delete().eq("id", lead.id);
    return {
      ok: false,
      message: "O lead foi criado, mas não foi possível vinculá-lo à conversa."
    };
  }

  return { ok: true, leadId: lead.id };
}

function toQualifiedConversation(
  conversation: WhatsappConversation
): QualifiedConversation {
  return {
    id: conversation.id,
    phone: conversation.phone,
    name: conversation.name,
    leadId: conversation.leadId,
    qualificationStatus: conversation.qualificationStatus
  };
}
