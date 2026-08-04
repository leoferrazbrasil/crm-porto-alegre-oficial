import type { ZapiChat } from "@/lib/zapi/client";

export type InboxFilter = "all" | "unread" | "individual" | "group";

export function filterAndSortChats(
  chats: readonly ZapiChat[],
  filter: InboxFilter
): ZapiChat[] {
  return chats
    .filter((chat) => {
      if (filter === "unread") return chat.unread > 0 || chat.messagesUnread > 0;
      if (filter === "individual") return !chat.isGroup;
      if (filter === "group") return chat.isGroup;
      return true;
    })
    .slice()
    .sort((first, second) => {
      const firstUnread = first.unread + first.messagesUnread;
      const secondUnread = second.unread + second.messagesUnread;
      if (firstUnread !== secondUnread) return secondUnread - firstUnread;
      return (second.lastMessageAt ?? "").localeCompare(first.lastMessageAt ?? "");
    });
}
