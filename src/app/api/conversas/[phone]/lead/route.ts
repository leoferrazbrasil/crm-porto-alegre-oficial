import { NextResponse } from "next/server";

import { requireCurrentAdmin } from "@/lib/auth/session";
import { createLeadFromQualifiedConversation } from "@/lib/whatsapp/qualification";
import { readZapiConfig } from "@/lib/zapi/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
      { ok: false, message: "Informe empresa, segmento, próxima ação e data." },
      { status: 400 }
    );
  }

  const input =
    typeof payload === "object" && payload !== null
      ? {
          companyName: String(
            (payload as { companyName?: unknown }).companyName ?? ""
          ),
          segment: String((payload as { segment?: unknown }).segment ?? ""),
          nextAction: String((payload as { nextAction?: unknown }).nextAction ?? ""),
          nextActionAt: String((payload as { nextActionAt?: unknown }).nextActionAt ?? "")
        }
      : { companyName: "", segment: "", nextAction: "", nextActionAt: "" };

  const { phone } = await context.params;
  const supabase = await createSupabaseServerClient();
  const result = await createLeadFromQualifiedConversation(
    supabase,
    config.config.instanceId,
    phone,
    profile.id,
    input
  );

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
