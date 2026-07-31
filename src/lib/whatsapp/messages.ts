export interface NormalizedReceivedMessage {
  instanceId: string;
  providerMessageId: string;
  phone: string;
  name: string | null;
  isGroup: boolean;
  direction: "inbound" | "outbound";
  messageType: "text";
  body: string;
  status: string | null;
  occurredAt: string;
}

export interface NormalizedDelivery {
  instanceId: string;
  providerMessageId: string;
  phone: string;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  occurredAt: string;
  error: string | null;
}

export type NormalizedMessageResult =
  | { ok: true; message: NormalizedReceivedMessage }
  | { ok: false; message: string };

export type NormalizedDeliveryResult =
  | { ok: true; delivery: NormalizedDelivery }
  | { ok: false; message: string };

const INVALID_WEBHOOK_MESSAGE = "Evento de webhook inválido.";

export function normalizeZapiReceivedMessage(
  payload: unknown,
  expectedInstanceId: string
): NormalizedMessageResult {
  if (!isRecord(payload)) return invalidWebhook();

  const instanceId = stringValue(payload.instanceId);
  const providerMessageId = stringValue(payload.messageId);
  const phone = stringValue(payload.phone);
  const body = isRecord(payload.text) ? stringValue(payload.text.message) : "";
  const occurredAt = timestampToIso(payload.momment);

  if (
    !expectedInstanceId ||
    instanceId !== expectedInstanceId ||
    !providerMessageId ||
    !phone ||
    !body ||
    !occurredAt
  ) {
    return invalidWebhook();
  }

  return {
    ok: true,
    message: {
      instanceId,
      providerMessageId,
      phone,
      name: stringValue(payload.chatName) || null,
      isGroup: payload.isGroup === true,
      direction: payload.fromMe === true ? "outbound" : "inbound",
      messageType: "text",
      body,
      status: stringValue(payload.status).toUpperCase() || null,
      occurredAt
    }
  };
}

export function normalizeZapiDelivery(
  payload: unknown,
  expectedInstanceId: string
): NormalizedDeliveryResult {
  if (!isRecord(payload)) return { ok: false, message: INVALID_WEBHOOK_MESSAGE };

  const instanceId = stringValue(payload.instanceId);
  const providerMessageId = stringValue(payload.messageId);
  const phone = stringValue(payload.phone);
  const occurredAt = timestampToIso(payload.momment);
  const providerError = stringValue(payload.error);

  if (
    !expectedInstanceId ||
    instanceId !== expectedInstanceId ||
    !providerMessageId ||
    !phone ||
    !occurredAt
  ) {
    return { ok: false, message: INVALID_WEBHOOK_MESSAGE };
  }

  return {
    ok: true,
    delivery: {
      instanceId,
      providerMessageId,
      phone,
      status: providerError ? "failed" : normalizeDeliveryStatus(payload.status),
      occurredAt,
      error: providerError ? "Não foi possível entregar a mensagem." : null
    }
  };
}

export function validateOutgoingText(
  value: unknown
): { ok: true; text: string } | { ok: false; message: string } {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    return { ok: false, message: "Digite uma mensagem antes de enviar." };
  }

  if (text.length > 4000) {
    return {
      ok: false,
      message: "A mensagem deve ter no máximo 4.000 caracteres."
    };
  }

  return { ok: true, text };
}

function invalidWebhook(): { ok: false; message: string } {
  return { ok: false, message: INVALID_WEBHOOK_MESSAGE };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function timestampToIso(value: unknown): string | null {
  const timestamp = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return null;

  const milliseconds = timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp;
  const date = new Date(milliseconds);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeDeliveryStatus(value: unknown): NormalizedDelivery["status"] {
  const status = stringValue(value).toLowerCase();
  if (status === "read" || status === "read_by_me") return "read";
  if (status === "received" || status === "delivered") return "delivered";
  if (status === "pending") return "pending";
  if (status === "sent") return "sent";
  return "sent";
}
