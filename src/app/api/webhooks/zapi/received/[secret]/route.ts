import { NextResponse } from "next/server";

import { readZapiConfig } from "@/lib/zapi/config";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import {
  processZapiReceivedWebhook,
  type ZapiWebhookRepository
} from "@/lib/whatsapp/webhook";
import {
  upsertConversationAndMessage,
  type PersistedWhatsappMessage
} from "@/lib/whatsapp/repository";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ secret: string }> }
) {
  const config = readZapiConfig();
  const webhookSecret = process.env.ZAPI_WEBHOOK_SECRET?.trim();

  if (!config.ok || !webhookSecret) {
    return NextResponse.json(
      { ok: false, message: "Webhook não configurado." },
      { status: 503 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Evento de webhook inválido." },
      { status: 400 }
    );
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const repository: ZapiWebhookRepository = {
      async persistReceived(message) {
        const result = await upsertConversationAndMessage(
          supabase,
          toPersistedMessage(message)
        );
        return { ok: result.ok };
      },
      async updateDelivery() {
        return { ok: true, updated: false };
      }
    };
    const { secret } = await context.params;
    const result = await processZapiReceivedWebhook(
      secret,
      webhookSecret,
      config.config.instanceId,
      payload,
      repository
    );

    return NextResponse.json(
      result.ok ? { ok: true } : { ok: false, message: result.message },
      { status: result.status }
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "Não foi possível registrar o evento." },
      { status: 500 }
    );
  }
}

function toPersistedMessage(
  message: Parameters<ZapiWebhookRepository["persistReceived"]>[0]
): PersistedWhatsappMessage {
  return { ...message, createdBy: null };
}
