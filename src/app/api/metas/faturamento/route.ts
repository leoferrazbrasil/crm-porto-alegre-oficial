import { NextResponse } from "next/server";

import { requireCurrentAdmin } from "@/lib/auth/session";
import {
  parseMonthlyTargetInput,
  upsertMonthlyRevenueTarget
} from "@/lib/crm/targets-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PUT(request: Request) {
  const { user } = await requireCurrentAdmin();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Informe uma meta mensal válida." },
      { status: 400 }
    );
  }

  const input = parseMonthlyTargetInput(payload);
  if (!input) {
    return NextResponse.json(
      { ok: false, message: "Informe uma competência e um valor não negativo." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const result = await upsertMonthlyRevenueTarget(supabase, input, user.id);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
