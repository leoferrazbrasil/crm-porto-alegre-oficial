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
  const qrcode = await client.getQrCodeImage();

  return NextResponse.json(qrcode, { status: qrcode.ok ? 200 : 502 });
}
