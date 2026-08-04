import { NextResponse } from "next/server";

import { requireCurrentAdmin } from "@/lib/auth/session";
import { createZapiClient } from "@/lib/zapi/client";
import { readZapiConfig } from "@/lib/zapi/config";

export async function POST() {
  await requireCurrentAdmin();

  const config = readZapiConfig();

  if (!config.ok) {
    return NextResponse.json(config, { status: 400 });
  }

  const client = createZapiClient(config.config);
  const result = await client.disconnect();

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
