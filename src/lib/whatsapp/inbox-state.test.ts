import { describe, expect, it } from "vitest";

import type { ZapiChat } from "@/lib/zapi/client";
import { filterAndSortChats } from "./inbox-state";

const chat = (phone: string, overrides: Partial<ZapiChat> = {}): ZapiChat => ({
  phone,
  name: phone,
  archived: false,
  pinned: false,
  unread: 0,
  messagesUnread: 0,
  lastMessageAt: null,
  isMuted: false,
  isMarkedSpam: false,
  isGroup: false,
  isGroupAnnouncement: false,
  ...overrides
});

describe("filterAndSortChats", () => {
  it("prioritizes unread individual chats and keeps groups out of the default view", () => {
    expect(
      filterAndSortChats(
        [
          chat("group", { isGroup: true, unread: 9 }),
          chat("read", { lastMessageAt: "2026-08-03T10:00:00.000Z" }),
          chat("unread", { unread: 1, lastMessageAt: "2026-08-03T09:00:00.000Z" })
        ],
        "individual"
      ).map((item) => item.phone)
    ).toEqual(["unread", "read"]);
  });

  it("returns only unread chats for the unread filter", () => {
    expect(
      filterAndSortChats(
        [chat("read"), chat("unread", { messagesUnread: 1 })],
        "unread"
      ).map((item) => item.phone)
    ).toEqual(["unread"]);
  });
});
