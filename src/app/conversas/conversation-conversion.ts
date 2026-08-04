import type { WhatsappQualificationStatus } from "@/lib/whatsapp/repository";

export interface ConversationConversionContext {
  qualificationStatus: WhatsappQualificationStatus;
  leadId: string | null;
}

export type ConversionAction =
  | { kind: "convert"; label: "Transformar em lead" }
  | { kind: "open"; label: "Abrir lead" }
  | { kind: "blocked"; label: "Disponível em Negociação" };

export function getConversionAction(
  conversation: ConversationConversionContext
): ConversionAction {
  if (conversation.leadId) {
    return { kind: "open", label: "Abrir lead" };
  }

  if (conversation.qualificationStatus === "negotiation") {
    return { kind: "convert", label: "Transformar em lead" };
  }

  return { kind: "blocked", label: "Disponível em Negociação" };
}
