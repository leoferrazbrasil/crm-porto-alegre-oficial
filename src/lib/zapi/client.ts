import type { ZapiConfig } from "./config";

const ZAPI_BASE_URL = "https://api.z-api.io";
const ZAPI_SAFE_ERROR = "Não foi possível consultar a Z-API neste momento.";

export type ZapiStatusResult =
  | {
      ok: true;
      connected: boolean;
      smartphoneConnected: boolean;
      message: string | null;
    }
  | {
      ok: false;
      message: string;
    };

export type ZapiQrCodeResult =
  | {
      ok: true;
      type: "image";
      imageBase64: string;
    }
  | {
      ok: true;
      type: "challenge";
      message: string;
    }
  | {
      ok: false;
      message: string;
  };

export interface ZapiChat {
  phone: string;
  name: string;
  archived: boolean;
  pinned: boolean;
  unread: number;
  messagesUnread: number;
  lastMessageAt: string | null;
  isMuted: boolean;
  isMarkedSpam: boolean;
  isGroup: boolean;
  isGroupAnnouncement: boolean;
}

export type ZapiChatsResult =
  | {
      ok: true;
      chats: ZapiChat[];
      page: number;
      pageSize: number;
    }
  | {
      ok: false;
      message: string;
    };

export interface ZapiClient {
  getStatus(): Promise<ZapiStatusResult>;
  getQrCodeImage(): Promise<ZapiQrCodeResult>;
  getChats(page?: number, pageSize?: number): Promise<ZapiChatsResult>;
}

type ZapiFetcher = typeof fetch;

export function createZapiClient(
  config: ZapiConfig,
  fetcher: ZapiFetcher = fetch
): ZapiClient {
  return {
    async getStatus() {
      const response = await callZapi(config, fetcher, "status");

      if (!response.ok) {
        return safeError();
      }

      const data = (await response.json()) as Partial<{
        connected: boolean;
        smartphoneConnected: boolean;
        error: string;
      }>;

      return {
        ok: true,
        connected: data.connected === true,
        smartphoneConnected: data.smartphoneConnected === true,
        message: data.error ?? null
      };
    },

    async getQrCodeImage() {
      const response = await callZapi(config, fetcher, "qr-code/image");

      if (!response.ok) {
        return safeError();
      }

      const data = (await response.json()) as Partial<{
        value: string;
        base64: string;
        qrcode: string;
        qrCode: string;
        challenge: unknown;
      }>;

      if (data.challenge) {
        return {
          ok: true,
          type: "challenge",
          message:
            "O WhatsApp solicitou uma verificação adicional por chave de acesso."
        };
      }

      const imageBase64 =
        data.value?.trim() ||
        data.base64?.trim() ||
        data.qrcode?.trim() ||
        data.qrCode?.trim();

      if (!imageBase64) {
        return {
          ok: false,
          message: "QR Code não disponível. Solicite um novo código em instantes."
        };
      }

      return {
        ok: true,
        type: "image",
        imageBase64
      };
    },

    async getChats(page = 1, pageSize = 20) {
      const response = await callZapi(
        config,
        fetcher,
        `chats?page=${page}&pageSize=${pageSize}`
      );

      if (!response.ok) {
        return safeError();
      }

      const data = (await response.json()) as unknown;
      const rows = Array.isArray(data)
        ? data
        : data && typeof data === "object" && "chats" in data
          ? (data as { chats?: unknown }).chats
          : [];

      return {
        ok: true,
        chats: Array.isArray(rows)
          ? rows.map((row) => normalizeChat(row as Record<string, unknown>))
          : [],
        page,
        pageSize
      };
    }
  };
}

function callZapi(
  config: ZapiConfig,
  fetcher: ZapiFetcher,
  path: string
) {
  return fetcher(
    `${ZAPI_BASE_URL}/instances/${config.instanceId}/token/${config.instanceToken}/${path}`,
    {
      headers: {
        "Client-Token": config.clientToken
      }
    }
  );
}

function normalizeChat(row: Record<string, unknown>): ZapiChat {
  return {
    phone: stringFromZapi(row.phone),
    name: stringFromZapi(row.name) || stringFromZapi(row.phone),
    archived: booleanFromZapi(row.archived),
    pinned: booleanFromZapi(row.pinned),
    unread: numberFromZapi(row.unread),
    messagesUnread: numberFromZapi(row.messagesUnread),
    lastMessageAt: timestampSecondsToIso(row.lastMessageTime),
    isMuted: booleanFromZapi(row.isMuted),
    isMarkedSpam: booleanFromZapi(row.isMarkedSpam),
    isGroup: booleanFromZapi(row.isGroup),
    isGroupAnnouncement: booleanFromZapi(row.isGroupAnnouncement)
  };
}

function stringFromZapi(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function booleanFromZapi(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    return ["true", "1", "yes"].includes(value.trim().toLowerCase());
  }

  return false;
}

function numberFromZapi(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function timestampSecondsToIso(value: unknown): string | null {
  const seconds = numberFromZapi(value);
  return seconds > 0 ? new Date(seconds * 1000).toISOString() : null;
}

function safeError(): ZapiStatusResult & ZapiQrCodeResult & ZapiChatsResult {
  return {
    ok: false,
    message: ZAPI_SAFE_ERROR
  };
}
