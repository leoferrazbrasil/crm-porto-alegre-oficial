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

export interface ZapiClient {
  getStatus(): Promise<ZapiStatusResult>;
  getQrCodeImage(): Promise<ZapiQrCodeResult>;
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
    }
  };
}

function callZapi(
  config: ZapiConfig,
  fetcher: ZapiFetcher,
  path: "status" | "qr-code/image"
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

function safeError(): ZapiStatusResult & ZapiQrCodeResult {
  return {
    ok: false,
    message: ZAPI_SAFE_ERROR
  };
}
