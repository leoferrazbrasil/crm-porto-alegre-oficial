"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

type ConnectionState = "idle" | "loading" | "ready" | "error";

type ZapiStatus =
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

type ZapiQrCode =
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

export function WhatsAppConnectionPanel() {
  const [statusState, setStatusState] = useState<ConnectionState>("idle");
  const [qrState, setQrState] = useState<ConnectionState>("idle");
  const [status, setStatus] = useState<ZapiStatus | null>(null);
  const [qrCode, setQrCode] = useState<ZapiQrCode | null>(null);

  const loadStatus = useCallback(async () => {
    setStatusState("loading");
    const payload = await fetchJson<ZapiStatus>("/api/zapi/status");
    setStatus(payload);
    setStatusState(payload.ok ? "ready" : "error");
  }, []);

  const loadQrCode = useCallback(async () => {
    setQrState("loading");
    const payload = await fetchJson<ZapiQrCode>("/api/zapi/qrcode");
    setQrCode(payload);
    setQrState(payload.ok ? "ready" : "error");
  }, []);

  return (
    <div className="whatsappGrid">
      <article className="integrationCard">
        <p className="eyebrow">Status da instância</p>
        <h2>Conexão Z-API</h2>
        <p>
          Consulte se a instância está conectada ao WhatsApp antes de solicitar
          um novo QR Code.
        </p>

        <div className="statusStack">
          <StatusPill
            label="WhatsApp"
            value={status?.ok && status.connected ? "Conectado" : "Não conectado"}
            tone={status?.ok && status.connected ? "success" : "attention"}
          />
          <StatusPill
            label="Celular"
            value={
              status?.ok && status.smartphoneConnected
                ? "Online"
                : "Sem confirmação"
            }
            tone={
              status?.ok && status.smartphoneConnected ? "success" : "neutral"
            }
          />
        </div>

        {status?.message ? (
          <p className={`authMessage authMessage${status.ok ? "success" : "error"}`}>
            {status.message}
          </p>
        ) : null}

        <button
          className="authButton"
          disabled={statusState === "loading"}
          type="button"
          onClick={() => void loadStatus()}
        >
          {statusState === "loading" ? "Consultando..." : "Atualizar status"}
        </button>
      </article>

      <article className="integrationCard">
        <p className="eyebrow">Leitura de QR Code</p>
        <h2>Conectar número</h2>
        <p>
          Gere o QR Code e leia pelo WhatsApp do número autorizado. O código
          expira rapidamente; se não funcionar, solicite um novo.
        </p>

        <div className="qrCodeFrame">
          {qrState === "loading" ? <span>Gerando QR Code...</span> : null}

          {qrCode?.ok && qrCode.type === "image" ? (
            <Image
              alt="QR Code de conexão do WhatsApp via Z-API"
              height={260}
              src={toQrCodeImageSource(qrCode.imageBase64)}
              unoptimized
              width={260}
            />
          ) : null}

          {qrCode?.ok && qrCode.type === "challenge" ? (
            <div className="challengeNotice">
              <strong>Verificação adicional necessária</strong>
              <span>{qrCode.message}</span>
            </div>
          ) : null}

          {qrCode && !qrCode.ok ? (
            <span className="qrError">{qrCode.message}</span>
          ) : null}

          {qrState === "idle" ? <span>QR Code ainda não solicitado.</span> : null}
        </div>

        <div className="formActions">
          <button
            className="authButton"
            disabled={qrState === "loading"}
            type="button"
            onClick={() => void loadQrCode()}
          >
            {qrState === "loading" ? "Carregando..." : "Gerar QR Code"}
          </button>
          <button
            className="secondaryButton"
            disabled={statusState === "loading"}
            type="button"
            onClick={() => void loadStatus()}
          >
            Conferir conexão
          </button>
        </div>
      </article>

      <article className="integrationCard integrationCardWide">
        <p className="eyebrow">Limite operacional da V1</p>
        <h2>Conexão não é automação</h2>
        <p>
          Esta versão apenas conecta e consulta a instância. Envio automático,
          disparos, webhooks, leitura de conversas e follow-up automatizado não
          estão ativos e exigem aprovação separada.
        </p>
      </article>
    </div>
  );
}

function StatusPill({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "success" | "attention" | "neutral";
}) {
  return (
    <div className={`connectionPill connectionPill${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json"
    }
  });
  return (await response.json()) as T;
}

function toQrCodeImageSource(value: string) {
  if (value.startsWith("data:image/")) {
    return value;
  }

  return `data:image/png;base64,${value}`;
}
