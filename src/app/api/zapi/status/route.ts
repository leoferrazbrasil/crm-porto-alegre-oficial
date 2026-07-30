import { NextResponse } from "next/server";

import { requireCurrentAdmin } from "@/lib/auth/session";
import { createZapiClient } from "@/lib/zapi/client";
import { readZapiConfig } from "@/lib/zapi/config";

export async function GET() {
  await requireCurrentAdmin();

  const config = readZapiConfig();

  if (!config.ok) {
    return NextResponse.json(config, { status: 400 });
  }

  const client = createZapiClient(config.config);
  const status = await client.getStatus();

  return NextResponse.json(status, { status: status.ok ? 200 : 502 });
}
