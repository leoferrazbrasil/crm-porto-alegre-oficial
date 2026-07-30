import { describe, expect, it } from "vitest";

import { createZapiClient } from "./client";
import { readZapiConfig } from "./config";

describe("readZapiConfig", () => {
  it("rejects missing Z-API server credentials without exposing secrets", () => {
    expect(readZapiConfig({})).toEqual({
      ok: false,
      message:
        "Configuração da Z-API incompleta. Preencha as variáveis server-side."
    });
  });

  it("returns the server-only Z-API credentials when all required values exist", () => {
    expect(
      readZapiConfig({
        ZAPI_INSTANCE_ID: "instance-1",
        ZAPI_INSTANCE_TOKEN: "token-1",
        ZAPI_CLIENT_TOKEN: "client-token-1"
      })
    ).toEqual({
      ok: true,
      config: {
        instanceId: "instance-1",
        instanceToken: "token-1",
        clientToken: "client-token-1"
      }
    });
  });
});

describe("createZapiClient", () => {
  it("requests instance status using the documented URL and Client-Token header", async () => {
    const calls: Array<{ url: string; headers: HeadersInit | undefined }> = [];
    const client = createZapiClient(
      {
        instanceId: "instance-1",
        instanceToken: "token-1",
        clientToken: "client-token-1"
      },
      async (url, init) => {
        calls.push({ url: String(url), headers: init?.headers });
        return jsonResponse({
          connected: true,
          smartphoneConnected: true,
          error: "You are already connected"
        });
      }
    );

    await expect(client.getStatus()).resolves.toEqual({
      ok: true,
      connected: true,
      smartphoneConnected: true,
      message: "You are already connected"
    });
    expect(calls).toEqual([
      {
        url: "https://api.z-api.io/instances/instance-1/token/token-1/status",
        headers: {
          "Client-Token": "client-token-1"
        }
      }
    ]);
  });

  it("normalizes a QR Code image response from Z-API", async () => {
    const client = createZapiClient(
      {
        instanceId: "instance-1",
        instanceToken: "token-1",
        clientToken: "client-token-1"
      },
      async () =>
        jsonResponse({
          value: "base64-image"
        })
    );

    await expect(client.getQrCodeImage()).resolves.toEqual({
      ok: true,
      type: "image",
      imageBase64: "base64-image"
    });
  });

  it("normalizes a challenge response when WhatsApp asks for passkey verification", async () => {
    const client = createZapiClient(
      {
        instanceId: "instance-1",
        instanceToken: "token-1",
        clientToken: "client-token-1"
      },
      async () =>
        jsonResponse({
          challenge: {
            challenge: "challenge-1",
            rpId: "whatsapp.com",
            timeout: 600000,
            userVerification: "required"
          }
        })
    );

    await expect(client.getQrCodeImage()).resolves.toEqual({
      ok: true,
      type: "challenge",
      message:
        "O WhatsApp solicitou uma verificação adicional por chave de acesso."
    });
  });

  it("returns a safe error when the Z-API response is not successful", async () => {
    const client = createZapiClient(
      {
        instanceId: "instance-1",
        instanceToken: "token-1",
        clientToken: "client-token-1"
      },
      async () => jsonResponse({ error: "raw provider detail" }, 500)
    );

    await expect(client.getStatus()).resolves.toEqual({
      ok: false,
      message: "Não foi possível consultar a Z-API neste momento."
    });
  });

  it("requests the paginated chat list with server-side credentials", async () => {
    const calls: Array<{ url: string; headers: HeadersInit | undefined }> = [];
    const client = createZapiClient(
      {
        instanceId: "instance-1",
        instanceToken: "token-1",
        clientToken: "client-token-1"
      },
      async (url, init) => {
        calls.push({ url: String(url), headers: init?.headers });
        return jsonResponse([]);
      }
    );

    await expect(client.getChats(2, 20)).resolves.toEqual({
      ok: true,
      chats: [],
      page: 2,
      pageSize: 20
    });
    expect(calls).toEqual([
      {
        url: "https://api.z-api.io/instances/instance-1/token/token-1/chats?page=2&pageSize=20",
        headers: {
          "Client-Token": "client-token-1"
        }
      }
    ]);
  });

  it("normalizes Z-API chat flags and epoch seconds for the inbox", async () => {
    const client = createZapiClient(
      {
        instanceId: "instance-1",
        instanceToken: "token-1",
        clientToken: "client-token-1"
      },
      async () =>
        jsonResponse([
          {
            archived: "false",
            pinned: "true",
            messagesUnread: 2,
            phone: "5511999999999",
            unread: "3",
            name: "Z-API SUPORTE",
            lastMessageTime: "1622991687",
            isMuted: "0",
            isMarkedSpam: "false",
            isGroupAnnouncement: false,
            isGroup: false
          }
        ])
    );

    await expect(client.getChats()).resolves.toEqual({
      ok: true,
      chats: [
        {
          phone: "5511999999999",
          name: "Z-API SUPORTE",
          archived: false,
          pinned: true,
          unread: 3,
          messagesUnread: 2,
          lastMessageAt: "2021-06-06T15:01:27.000Z",
          isMuted: false,
          isMarkedSpam: false,
          isGroup: false,
          isGroupAnnouncement: false
        }
      ],
      page: 1,
      pageSize: 20
    });
  });

  it("returns a safe error when the chat response is not successful", async () => {
    const client = createZapiClient(
      {
        instanceId: "instance-1",
        instanceToken: "token-1",
        clientToken: "client-token-1"
      },
      async () => jsonResponse({ error: "raw provider detail" }, 500)
    );

    await expect(client.getChats()).resolves.toEqual({
      ok: false,
      message: "Não foi possível consultar a Z-API neste momento."
    });
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json"
    }
  });
}
