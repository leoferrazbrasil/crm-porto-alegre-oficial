import type {
  ZapiChat,
  ZapiChatsResult,
  ZapiSendTextResult
} from "@/lib/zapi/client";
import { validateOutgoingText } from "./messages";
import type { PersistedWhatsappMessage } from "./repository";

export interface ConversationServiceDependencies {
  instanceId: string;
  getChats(): Promise<ZapiChatsResult>;
  sendText(phone: string, message: string): Promise<ZapiSendTextResult>;
  persistOutbound(message: PersistedWhatsappMessage): Promise<{ ok: boolean }>;
}

export type ManualSendResult =
  | { ok: true; messageId: string }
  | { ok: false; message: string };

export async function sendManualText(
  dependencies: ConversationServiceDependencies,
  phone: string,
  rawMessage: unknown,
  actorId: string
): Promise<ManualSendResult> {
  const text = validateOutgoingText(rawMessage);
  if (!text.ok) return text;

  const chats = await dependencies.getChats();
  if (!chats.ok) {
    return {
      ok: false,
      message: "Não foi possível validar o contato selecionado."
    };
  }

  const selectedChat = chats.chats.find((chat) => chat.phone === phone);
  if (!selectedChat) {
    return {
      ok: false,
      message: "O contato selecionado não está disponível na lista atual."
    };
  }

  const sent = await dependencies.sendText(phone, text.text);
  if (!sent.ok) {
    return { ok: false, message: "Não foi possível enviar a mensagem." };
  }

  const persisted = await dependencies.persistOutbound(
    buildOutboundMessage(
      dependencies.instanceId,
      selectedChat,
      sent.messageId,
      text.text,
      actorId
    )
  );
  if (!persisted.ok) {
    return {
      ok: false,
      message: "A mensagem foi enviada, mas não pôde ser registrada no CRM."
    };
  }

  return { ok: true, messageId: sent.messageId };
}

function buildOutboundMessage(
  instanceId: string,
  chat: ZapiChat,
  messageId: string,
  body: string,
  actorId: string
): PersistedWhatsappMessage {
  return {
    instanceId,
    providerMessageId: messageId,
    phone: chat.phone,
    name: chat.name || null,
    isGroup: chat.isGroup,
    direction: "outbound",
    messageType: "text",
    body,
    status: "pending",
    occurredAt: new Date().toISOString(),
    createdBy: actorId
  };
}
