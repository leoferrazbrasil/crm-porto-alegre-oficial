import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { ZapiChat } from "@/lib/zapi/client";
import {
  isSelectedChatPhone,
  getConversation,
  listConversationMessages,
  updateConversationQualificationStatus,
  updateMessageDelivery,
  upsertConversationAndMessage,
  type PersistedWhatsappMessage,
  type WhatsappQualificationStatus
} from "./repository";

const message: PersistedWhatsappMessage = {
  instanceId: "instance-1",
  providerMessageId: "message-1",
  phone: "5511999999999",
  name: "Lead Teste",
  isGroup: false,
  direction: "inbound",
  messageType: "text",
  body: "Olá",
  status: "RECEIVED",
  occurredAt: "2024-03-09T16:00:00.000Z",
  createdBy: null,
  attribution: {
    source: "facebook",
    campaign: "poa-inbound-01",
    gclid: "gclid-123"
  }
};

describe("whatsapp repository", () => {
  it("returns the persisted acquisition metadata for a selected conversation", async () => {
    const client = fakeClient({
      conversations: {
        id: "conversation-1",
        instance_id: "instance-1",
        phone: "5511999999999",
        name: "Lead Teste",
        is_group: false,
        lead_id: null,
        source_channel: "WhatsApp inbound",
        source_detail: "facebook",
        campaign: "poa-inbound-01",
        click_id: "gclid-123",
        qualification_status: "qualifying",
        last_message_at: "2024-03-09T16:00:00.000Z"
      }
    }) as unknown as SupabaseClient;

    await expect(
      getConversation(client, "instance-1", "5511999999999")
    ).resolves.toMatchObject({
      phone: "5511999999999",
      sourceChannel: "WhatsApp inbound",
      sourceDetail: "facebook",
      campaign: "poa-inbound-01",
      clickId: "gclid-123",
      qualificationStatus: "qualifying"
    });
  });

  it("updates only the selected conversation qualification status", async () => {
    const calls: Array<{ table: string; method: string; payload?: unknown }> = [];
    const client = fakeClient(
      { conversationStatus: { id: "conversation-1", qualification_status: "negotiation" } },
      calls
    ) as unknown as SupabaseClient;

    await expect(
      updateConversationQualificationStatus(
        client,
        "instance-1",
        "5511999999999",
        "negotiation" as WhatsappQualificationStatus
      )
    ).resolves.toEqual({
      ok: true,
      qualificationStatus: "negotiation"
    });

    expect(calls).toEqual([
      {
        table: "whatsapp_conversations",
        method: "update",
        payload: { qualification_status: "negotiation" }
      }
    ]);
  });

  it("upserts a conversation and ignores a repeated provider message", async () => {
    const calls: Array<{ table: string; method: string; payload?: unknown }> = [];
    const client = fakeClient({
      conversations: {
        id: "conversation-1"
      },
      messageUpsert: null
    }, calls) as unknown as SupabaseClient;

    await expect(upsertConversationAndMessage(client, message)).resolves.toEqual({
      ok: true,
      conversationId: "conversation-1"
    });
    expect(calls).toEqual([
      {
        table: "whatsapp_conversations",
        method: "upsert",
        payload: {
          instance_id: "instance-1",
          phone: "5511999999999",
          name: "Lead Teste",
          is_group: false,
          last_message_at: "2024-03-09T16:00:00.000Z",
          source_channel: "WhatsApp inbound",
          source_detail: "facebook",
          campaign: "poa-inbound-01",
          click_id: "gclid-123"
        }
      },
      {
        table: "whatsapp_messages",
        method: "upsert",
        payload: {
          conversation_id: "conversation-1",
          instance_id: "instance-1",
          provider_message_id: "message-1",
          phone: "5511999999999",
          direction: "inbound",
          message_type: "text",
          body: "Olá",
          status: "RECEIVED",
          occurred_at: "2024-03-09T16:00:00.000Z",
          created_by: null
        }
      }
    ]);
  });

  it("updates only the matching outbound message on delivery", async () => {
    const calls: Array<{ table: string; method: string; payload?: unknown }> = [];
    const client = fakeClient({ delivery: { id: "message-row-1" } }, calls) as unknown as SupabaseClient;

    await expect(
      updateMessageDelivery(client, {
        instanceId: "instance-1",
        providerMessageId: "message-1",
        phone: "5511999999999",
        status: "delivered",
        occurredAt: "2024-03-09T16:01:00.000Z",
        error: null
      })
    ).resolves.toEqual({ ok: true, updated: true });
    expect(calls).toEqual([
      {
        table: "whatsapp_messages",
        method: "update",
        payload: { status: "delivered", occurred_at: "2024-03-09T16:01:00.000Z" }
      }
    ]);
  });

  it("lists a selected conversation timeline in chronological order", async () => {
    const client = fakeClient({
      conversations: { id: "conversation-1" },
      messages: [
        {
          id: "row-1",
          instance_id: "instance-1",
          conversation_id: "conversation-1",
          provider_message_id: "message-1",
          phone: "5511999999999",
          direction: "inbound",
          message_type: "text",
          body: "Olá",
          status: "RECEIVED",
          occurred_at: "2024-03-09T16:00:00.000Z",
          created_by: null,
          created_at: "2024-03-09T16:00:00.000Z"
        }
      ]
    }) as unknown as SupabaseClient;

    await expect(
      listConversationMessages(client, "instance-1", "5511999999999")
    ).resolves.toEqual([
      {
        id: "row-1",
        providerMessageId: "message-1",
        phone: "5511999999999",
        direction: "inbound",
        messageType: "text",
        body: "Olá",
        status: "RECEIVED",
        occurredAt: "2024-03-09T16:00:00.000Z",
        createdBy: null,
        createdAt: "2024-03-09T16:00:00.000Z"
      }
    ]);
  });

  it("accepts only a phone returned by the current chat list", () => {
    const chats = [{ phone: "5511999999999" }] as ZapiChat[];
    expect(isSelectedChatPhone(chats, "5511999999999")).toBe(true);
    expect(isSelectedChatPhone(chats, "5511888888888")).toBe(false);
  });
});

function fakeClient(
  result: {
    conversations?: { id: string } | null;
    conversationStatus?: { id: string; qualification_status: string } | null;
    messageUpsert?: unknown;
    delivery?: { id: string } | null;
    messages?: unknown[];
  },
  calls: Array<{ table: string; method: string; payload?: unknown }> = []
) {
  return {
    from(table: string) {
      const state = { filters: [] as Array<[string, unknown]> };
      return {
        upsert(payload: unknown) {
          calls.push({ table, method: "upsert", payload });
          return {
            select() {
              return {
                single: async () => ({ data: result.conversations ?? null, error: null })
              };
            }
          };
        },
        update(payload: unknown) {
          calls.push({ table, method: "update", payload });
          if (table === "whatsapp_conversations") {
            return {
              eq() {
                return {
                  eq() {
                    return {
                      select() {
                        return {
                          maybeSingle: async () => ({
                            data: result.conversationStatus ?? null,
                            error: null
                          })
                        };
                      }
                    };
                  }
                };
              }
            };
          }
          return {
            eq() {
              return {
                eq() {
                  return {
                    eq() {
                      return {
                        select() {
                          return {
                            maybeSingle: async () => ({ data: result.delivery ?? null, error: null })
                          };
                        }
                      };
                    }
                  };
                }
              };
            }
          };
        },
        select() {
          const filterable = {
            eq(column: string, value: unknown) {
              state.filters.push([column, value]);
              return filterable;
            },
            maybeSingle: async () => ({ data: result.conversations ?? null, error: null }),
            order: async () => ({ data: result.messages ?? [], error: null })
          };
          return filterable;
        }
      };
    }
  };
}
