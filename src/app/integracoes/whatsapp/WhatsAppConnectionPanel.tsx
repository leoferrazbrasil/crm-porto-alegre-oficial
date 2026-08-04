"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const QR_REFRESH_INTERVAL_MS = 15_000;

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

type ZapiDisconnect =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

export function WhatsAppConnectionPanel() {
  const [statusState, setStatusState] = useState<ConnectionState>("idle");
  const [qrState, setQrState] = useState<ConnectionState>("idle");
  const [disconnectState, setDisconnectState] =
    useState<ConnectionState>("idle");
  const [status, setStatus] = useState<ZapiStatus | null>(null);
  const [qrCode, setQrCode] = useState<ZapiQrCode | null>(null);
  const [disconnectMessage, setDisconnectMessage] = useState<string | null>(null);
  const [qrPollingEnabled, setQrPollingEnabled] = useState(false);
  const qrRequestInFlight = useRef(false);

  const loadQrCode = useCallback(async (options?: { silent?: boolean }) => {
    if (qrRequestInFlight.current) return;

    qrRequestInFlight.current = true;
    if (!options?.silent) setQrState("loading");

    try {
      const payload = await fetchJson<ZapiQrCode>("/api/zapi/qrcode");
      setQrCode(payload);
      setQrState(payload.ok ? "ready" : "error");
    } finally {
      qrRequestInFlight.current = false;
    }
  }, []);

  const loadStatus = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setStatusState("loading");
    setDisconnectMessage(null);

    const payload = await fetchJson<ZapiStatus>("/api/zapi/status");
    setStatus(payload);
    setStatusState(payload.ok ? "ready" : "error");

    if (payload.ok && payload.connected) {
      setQrPollingEnabled(false);
      setQrCode(null);
      setQrState("idle");
    } else if (payload.ok) {
      setQrPollingEnabled(true);
      void loadQrCode({ silent: true });
    }
  }, [loadQrCode]);

  const disconnectInstance = useCallback(async () => {
    if (
      disconnectState === "loading" ||
      !window.confirm(
        "Deseja desconectar o número atual? Será necessário ler um novo QR Code para reconectar."
      )
    ) {
      return;
    }

    setDisconnectState("loading");
    setDisconnectMessage(null);

    try {
      const payload = await fetchJson<ZapiDisconnect>("/api/zapi/disconnect", {
        method: "POST"
      });

      if (!payload.ok) {
        setDisconnectState("error");
        setDisconnectMessage(payload.message);
        return;
      }

      setDisconnectState("ready");
      setStatus({
        ok: true,
        connected: false,
        smartphoneConnected: false,
        message: payload.message
      });
      setQrCode(null);
      setQrState("idle");
      setQrPollingEnabled(true);
      void loadQrCode();
    } catch {
      setDisconnectState("error");
      setDisconnectMessage("Não foi possível desconectar a instância neste momento.");
    }
  }, [disconnectState, loadQrCode]);

  useEffect(() => {
    if (!qrPollingEnabled) return;

    const intervalId = window.setInterval(() => {
      void loadStatus({ silent: true });
    }, QR_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadStatus, qrPollingEnabled]);

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

        {disconnectMessage ? (
          <p className="authMessage authMessageerror">{disconnectMessage}</p>
        ) : null}

        <div className="formActions">
          <button
            className="authButton"
            disabled={statusState === "loading" || disconnectState === "loading"}
            type="button"
            onClick={() => void loadStatus()}
          >
            {statusState === "loading" ? "Consultando..." : "Atualizar status"}
          </button>
          {status?.ok && status.connected ? (
            <button
              className="dangerButton integrationDangerButton"
              disabled={disconnectState === "loading"}
              type="button"
              onClick={() => void disconnectInstance()}
            >
              {disconnectState === "loading"
                ? "Desconectando..."
                : "Desconectar número"}
            </button>
          ) : null}
        </div>
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
            onClick={() => {
              setQrPollingEnabled(true);
              void loadQrCode();
            }}
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

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init?.headers ?? {})
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
