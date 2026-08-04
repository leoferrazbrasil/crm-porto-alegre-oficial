import { describe, expect, it, vi } from "vitest";

import { sendManualText } from "./conversation-service";

const chat = {
  phone: "5511999999999",
  name: "Lead Teste",
  archived: false,
  pinned: false,
  unread: 1,
  messagesUnread: 1,
  lastMessageAt: null,
  isMuted: false,
  isMarkedSpam: false,
  isGroup: false,
  isGroupAnnouncement: false
};

describe("sendManualText", () => {
  it("validates the selected chat before calling send-text", async () => {
    const sendText = vi.fn();
    const persistOutbound = vi.fn();

    await expect(
      sendManualText(
        {
          instanceId: "instance-1",
          getChats: vi.fn().mockResolvedValue({ ok: true, chats: [chat] }),
          sendText,
          persistOutbound
        },
        "5511888888888",
        "Olá",
        "admin-1"
      )
    ).resolves.toEqual({
      ok: false,
      message: "O contato selecionado não está disponível na lista atual."
    });
    expect(sendText).not.toHaveBeenCalled();
    expect(persistOutbound).not.toHaveBeenCalled();
  });

  it("sends and persists one manual outbound text for the selected chat", async () => {
    const sendText = vi.fn().mockResolvedValue({
      ok: true,
      zaapId: "zaap-1",
      messageId: "message-1"
    });
    const persistOutbound = vi.fn().mockResolvedValue({ ok: true });

    await expect(
      sendManualText(
        {
          instanceId: "instance-1",
          getChats: vi.fn().mockResolvedValue({ ok: true, chats: [chat] }),
          sendText,
          persistOutbound
        },
        chat.phone,
        "  Olá, posso ajudar?  ",
        "admin-1"
      )
    ).resolves.toMatchObject({ ok: true, messageId: "message-1" });
    expect(sendText).toHaveBeenCalledWith(chat.phone, "Olá, posso ajudar?");
    expect(persistOutbound).toHaveBeenCalledWith(
      expect.objectContaining({
        providerMessageId: "message-1",
        phone: chat.phone,
        body: "Olá, posso ajudar?",
        direction: "outbound",
        status: "pending",
        createdBy: "admin-1"
      })
    );
  });

  it("rejects empty and oversized text before touching the provider", async () => {
    const sendText = vi.fn();
    const dependencies = {
      instanceId: "instance-1",
      getChats: vi.fn().mockResolvedValue({ ok: true, chats: [chat] }),
      sendText,
      persistOutbound: vi.fn()
    };

    await expect(sendManualText(dependencies, chat.phone, " ", "admin-1")).resolves.toEqual({
      ok: false,
      message: "Digite uma mensagem antes de enviar."
    });
    await expect(
      sendManualText(dependencies, chat.phone, "a".repeat(4001), "admin-1")
    ).resolves.toEqual({
      ok: false,
      message: "A mensagem deve ter no máximo 4.000 caracteres."
    });
    expect(sendText).not.toHaveBeenCalled();
  });
});
