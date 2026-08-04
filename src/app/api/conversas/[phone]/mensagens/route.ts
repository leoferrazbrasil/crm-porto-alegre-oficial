import { NextResponse } from "next/server";

import { requireCurrentAdmin } from "@/lib/auth/session";
import {
  getConversation,
  listConversationMessages
} from "@/lib/whatsapp/repository";
import { readZapiConfig } from "@/lib/zapi/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ phone: string }> }
) {
  await requireCurrentAdmin();
  const config = readZapiConfig();

  if (!config.ok) {
    return NextResponse.json(config, { status: 503 });
  }

  const { phone } = await context.params;
  const supabase = await createSupabaseServerClient();
  const conversation = await getConversation(
    supabase,
    config.config.instanceId,
    phone
  );
  const messages = await listConversationMessages(
    supabase,
    config.config.instanceId,
    phone
  );

  return NextResponse.json({ ok: true, conversation, messages }, { status: 200 });
}
