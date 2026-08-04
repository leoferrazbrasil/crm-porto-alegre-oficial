import { NextResponse } from "next/server";

import { requireCurrentAdmin } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createZapiClient } from "@/lib/zapi/client";
import { readZapiConfig } from "@/lib/zapi/config";
import {
  sendManualText,
  type ConversationServiceDependencies
} from "@/lib/whatsapp/conversation-service";
import {
  upsertConversationAndMessage,
  type PersistedWhatsappMessage
} from "@/lib/whatsapp/repository";

export async function POST(
  request: Request,
  context: { params: Promise<{ phone: string }> }
) {
  const { profile } = await requireCurrentAdmin();
  const config = readZapiConfig();

  if (!config.ok) {
    return NextResponse.json(config, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Informe uma mensagem válida." },
      { status: 400 }
    );
  }

  const { phone } = await context.params;
  const message =
    typeof payload === "object" && payload !== null && "message" in payload
      ? (payload as { message?: unknown }).message
      : undefined;
  const supabase = await createSupabaseServerClient();
  const zapi = createZapiClient(config.config);
  const dependencies: ConversationServiceDependencies = {
    instanceId: config.config.instanceId,
    getChats: () => zapi.getChats(1, 100),
    sendText: (selectedPhone, text) => zapi.sendText(selectedPhone, text),
    persistOutbound: (outbound: PersistedWhatsappMessage) =>
      upsertConversationAndMessage(supabase, outbound)
  };

  try {
    const result = await sendManualText(
      dependencies,
      phone,
      message,
      profile.id
    );

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Não foi possível enviar a mensagem." },
      { status: 502 }
    );
  }
}
