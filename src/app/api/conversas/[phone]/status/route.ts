import { NextResponse } from "next/server";

import { requireCurrentAdmin } from "@/lib/auth/session";
import {
  updateConversationQualificationStatus
} from "@/lib/whatsapp/repository";
import { parseQualificationStatus } from "@/lib/whatsapp/qualification";
import { readZapiConfig } from "@/lib/zapi/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ phone: string }> }
) {
  await requireCurrentAdmin();
  const config = readZapiConfig();

  if (!config.ok) {
    return NextResponse.json(config, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Informe um estado válido." },
      { status: 400 }
    );
  }

  const status =
    typeof payload === "object" && payload !== null && "status" in payload
      ? parseQualificationStatus((payload as { status?: unknown }).status)
      : null;

  if (!status) {
    return NextResponse.json(
      { ok: false, message: "Estado da jornada inválido." },
      { status: 400 }
    );
  }

  const { phone } = await context.params;
  const supabase = await createSupabaseServerClient();
  const result = await updateConversationQualificationStatus(
    supabase,
    config.config.instanceId,
    phone,
    status
  );

  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
