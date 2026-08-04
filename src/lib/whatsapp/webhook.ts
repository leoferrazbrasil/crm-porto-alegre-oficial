import { timingSafeEqual } from "node:crypto";

import {
  normalizeZapiDelivery,
  normalizeZapiReceivedMessage,
  type NormalizedDelivery,
  type NormalizedReceivedMessage
} from "./messages";

export interface ZapiWebhookRepository {
  persistReceived(message: NormalizedReceivedMessage): Promise<{ ok: boolean }>;
  updateDelivery(delivery: NormalizedDelivery): Promise<{ ok: boolean; updated: boolean }>;
}

export type WebhookProcessResult =
  | { ok: true; status: 200 }
  | { ok: false; status: 400 | 401 | 500; message: string };

export async function processZapiReceivedWebhook(
  secret: string,
  expectedSecret: string,
  expectedInstanceId: string,
  payload: unknown,
  repository: ZapiWebhookRepository
): Promise<WebhookProcessResult> {
  if (!secretsMatch(secret, expectedSecret)) {
    return { ok: false, status: 401, message: "Webhook não autorizado." };
  }

  const normalized = normalizeZapiReceivedMessage(payload, expectedInstanceId);
  if (!normalized.ok) {
    return { ok: false, status: 400, message: normalized.message };
  }

  try {
    const persisted = await repository.persistReceived(normalized.message);
    return persisted.ok
      ? { ok: true, status: 200 }
      : { ok: false, status: 500, message: "Não foi possível registrar o evento." };
  } catch {
    return { ok: false, status: 500, message: "Não foi possível registrar o evento." };
  }
}

export async function processZapiDeliveryWebhook(
  secret: string,
  expectedSecret: string,
  expectedInstanceId: string,
  payload: unknown,
  repository: ZapiWebhookRepository
): Promise<WebhookProcessResult> {
  if (!secretsMatch(secret, expectedSecret)) {
    return { ok: false, status: 401, message: "Webhook não autorizado." };
  }

  const normalized = normalizeZapiDelivery(payload, expectedInstanceId);
  if (!normalized.ok) {
    return { ok: false, status: 400, message: normalized.message };
  }

  try {
    const updated = await repository.updateDelivery(normalized.delivery);
    return updated.ok
      ? { ok: true, status: 200 }
      : { ok: false, status: 500, message: "Não foi possível registrar o evento." };
  } catch {
    return { ok: false, status: 500, message: "Não foi possível registrar o evento." };
  }
}

function secretsMatch(input: string, expected: string): boolean {
  if (!input || !expected) return false;

  const inputBytes = Buffer.from(input);
  const expectedBytes = Buffer.from(expected);
  return (
    inputBytes.length === expectedBytes.length &&
    timingSafeEqual(inputBytes, expectedBytes)
  );
}
