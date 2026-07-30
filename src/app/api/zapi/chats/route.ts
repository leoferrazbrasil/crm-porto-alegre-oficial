import { NextResponse } from "next/server";

import { requireCurrentAdmin } from "@/lib/auth/session";
import { createZapiClient } from "@/lib/zapi/client";
import { parseChatsPagination } from "@/lib/zapi/pagination";
import { readZapiConfig } from "@/lib/zapi/config";

export async function GET(request: Request) {
  await requireCurrentAdmin();

  const config = readZapiConfig();

  if (!config.ok) {
    return NextResponse.json(config, { status: 400 });
  }

  const pagination = parseChatsPagination(new URL(request.url).searchParams);
  const client = createZapiClient(config.config);
  const chats = await client.getChats(pagination.page, pagination.pageSize);

  return NextResponse.json(chats, { status: chats.ok ? 200 : 502 });
}
