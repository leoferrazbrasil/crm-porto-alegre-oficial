import { describe, expect, it } from "vitest";

import {
  normalizeZapiDelivery,
  normalizeZapiReceivedMessage,
  validateOutgoingText
} from "./messages";

const basePayload = {
  instanceId: "instance-1",
  messageId: "message-1",
  phone: "5511999999999",
  chatName: "Lead Teste",
  fromMe: false,
  status: "RECEIVED",
  momment: 1710000000000,
  text: { message: "Olá, quero saber mais" }
};

describe("normalizeZapiReceivedMessage", () => {
  it("normalizes a text received callback without retaining the raw payload", () => {
    expect(normalizeZapiReceivedMessage(basePayload, "instance-1")).toEqual({
      ok: true,
      message: {
        instanceId: "instance-1",
        providerMessageId: "message-1",
        phone: "5511999999999",
        name: "Lead Teste",
        isGroup: false,
        direction: "inbound",
        messageType: "text",
        body: "Olá, quero saber mais",
        status: "RECEIVED",
        occurredAt: "2024-03-09T16:00:00.000Z"
      }
    });
  });

  it.each([
    ["the wrong instance", { instanceId: "other-instance" }],
    ["a missing message id", { messageId: "" }],
    ["a missing phone", { phone: "" }],
    ["a missing text body", { text: {} }],
    [
      "a media-only event",
      { text: undefined, image: { imageUrl: "https://example.test/image" } }
    ]
  ])("rejects %s before persistence", (_reason, override) => {
    expect(
      normalizeZapiReceivedMessage({ ...basePayload, ...override }, "instance-1")
    ).toMatchObject({ ok: false });
  });
});

describe("normalizeZapiDelivery", () => {
  it("normalizes delivery status without requiring a message body", () => {
    expect(
      normalizeZapiDelivery(
        {
          instanceId: "instance-1",
          messageId: "message-1",
          phone: "5511999999999",
          momment: 1710000000000,
          type: "DeliveryCallback"
        },
        "instance-1"
      )
    ).toEqual({
      ok: true,
      delivery: {
        instanceId: "instance-1",
        providerMessageId: "message-1",
        phone: "5511999999999",
        status: "sent",
        occurredAt: "2024-03-09T16:00:00.000Z",
        error: null
      }
    });
  });

  it("maps a provider error to a failed status without exposing its detail", () => {
    expect(
      normalizeZapiDelivery(
        {
          ...basePayload,
          text: undefined,
          fromMe: true,
          error: "raw provider credential detail"
        },
        "instance-1"
      )
    ).toEqual({
      ok: true,
      delivery: expect.objectContaining({
        status: "failed",
        error: "Não foi possível entregar a mensagem."
      })
    });
  });
});

describe("validateOutgoingText", () => {
  it("trims an acceptable message", () => {
    expect(validateOutgoingText("  Olá, tudo bem?  ")).toEqual({
      ok: true,
      text: "Olá, tudo bem?"
    });
  });

  it("rejects an empty or oversized message", () => {
    expect(validateOutgoingText("   ")).toEqual({
      ok: false,
      message: "Digite uma mensagem antes de enviar."
    });
    expect(validateOutgoingText("a".repeat(4001))).toEqual({
      ok: false,
      message: "A mensagem deve ter no máximo 4.000 caracteres."
    });
  });
});
