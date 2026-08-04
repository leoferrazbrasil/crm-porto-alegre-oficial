import { describe, expect, it, vi } from "vitest";

import {
  processZapiDeliveryWebhook,
  processZapiReceivedWebhook
} from "./webhook";

const payload = {
  instanceId: "instance-1",
  messageId: "message-1",
  phone: "5511999999999",
  chatName: "Lead Teste",
  fromMe: false,
  momment: 1710000000000,
  status: "RECEIVED",
  text: { message: "Olá" }
};

describe("Z-API webhook processing", () => {
  it("rejects an incorrect path secret without persisting", async () => {
    const repository = {
      persistReceived: vi.fn(),
      updateDelivery: vi.fn()
    };

    await expect(
      processZapiReceivedWebhook("wrong", "expected", "instance-1", payload, repository)
    ).resolves.toEqual({
      ok: false,
      status: 401,
      message: "Webhook não autorizado."
    });
    expect(repository.persistReceived).not.toHaveBeenCalled();
  });

  it("rejects an instance mismatch without persisting", async () => {
    const repository = {
      persistReceived: vi.fn(),
      updateDelivery: vi.fn()
    };

    await expect(
      processZapiReceivedWebhook("expected", "expected", "other-instance", payload, repository)
    ).resolves.toMatchObject({ ok: false, status: 400 });
    expect(repository.persistReceived).not.toHaveBeenCalled();
  });

  it("persists a valid received text event", async () => {
    const repository = {
      persistReceived: vi.fn().mockResolvedValue({ ok: true }),
      updateDelivery: vi.fn()
    };

    await expect(
      processZapiReceivedWebhook("expected", "expected", "instance-1", payload, repository)
    ).resolves.toEqual({ ok: true, status: 200 });
    expect(repository.persistReceived).toHaveBeenCalledWith(
      expect.objectContaining({ providerMessageId: "message-1", body: "Olá" })
    );
  });

  it("updates an outbound delivery callback without requiring its body", async () => {
    const repository = {
      persistReceived: vi.fn(),
      updateDelivery: vi.fn().mockResolvedValue({ ok: true, updated: true })
    };

    await expect(
      processZapiDeliveryWebhook(
        "expected",
        "expected",
        "instance-1",
        {
          instanceId: "instance-1",
          messageId: "message-1",
          phone: "5511999999999",
          momment: 1710000000000
        },
        repository
      )
    ).resolves.toEqual({ ok: true, status: 200 });
    expect(repository.updateDelivery).toHaveBeenCalledWith(
      expect.objectContaining({ providerMessageId: "message-1", status: "sent" })
    );
  });
});
