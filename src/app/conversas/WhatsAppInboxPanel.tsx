"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import type { ZapiChat } from "@/lib/zapi/client";
import type {
  WhatsappConversation,
  WhatsappMessage
} from "@/lib/whatsapp/repository";
import {
  filterAndSortChats,
  type InboxFilter
} from "@/lib/whatsapp/inbox-state";

interface ChatsResponse {
  ok: boolean;
  chats?: ZapiChat[];
  message?: string;
}

interface TimelineResponse {
  ok: boolean;
  conversation?: WhatsappConversation | null;
  messages?: WhatsappMessage[];
  message?: string;
}

interface SendResponse {
  ok: boolean;
  messageId?: string;
  message?: string;
}

const POLL_INTERVAL_MS = 5000;

export function WhatsAppInboxPanel() {
  const [chats, setChats] = useState<ZapiChat[]>([]);
  const [filter, setFilter] = useState<InboxFilter>("individual");
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [conversation, setConversation] = useState<WhatsappConversation | null>(null);
  const [messages, setMessages] = useState<WhatsappMessage[]>([]);
  const [listState, setListState] = useState<"loading" | "ready" | "error">("loading");
  const [timelineState, setTimelineState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const visibleChats = useMemo(
    () => filterAndSortChats(chats, filter),
    [chats, filter]
  );
  const selectedChat = chats.find((chat) => chat.phone === selectedPhone) ?? null;

  async function requestChats(showLoading = false) {
    if (showLoading) setListState("loading");

    try {
      const response = await fetch("/api/zapi/chats?page=1&pageSize=50", {
        cache: "no-store"
      });
      const data = (await response.json()) as ChatsResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Não foi possível carregar as conversas.");
      }

      setChats(data.chats ?? []);
      setListState("ready");
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar as conversas."
      );
      setListState("error");
    }
  }

  async function requestTimeline(phone: string, showLoading = true) {
    if (showLoading) setTimelineState("loading");

    try {
      const response = await fetch(
        `/api/conversas/${encodeURIComponent(phone)}/mensagens`,
        { cache: "no-store" }
      );
      const data = (await response.json()) as TimelineResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Não foi possível carregar a conversa.");
      }

      setConversation(data.conversation ?? null);
      setMessages(data.messages ?? []);
      setTimelineState("ready");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar a conversa."
      );
      setTimelineState("error");
    }
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void requestChats(true);
    }, 0);

    const timer = window.setInterval(() => {
      void requestChats();
      if (selectedPhone) void requestTimeline(selectedPhone, false);
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, [selectedPhone]);

  function selectChat(chat: ZapiChat) {
    if (chat.isGroup) return;
    setSelectedPhone(chat.phone);
    setSendState("idle");
    setDraft("");
    void requestTimeline(chat.phone);
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPhone || !draft.trim() || sendState === "sending") return;

    setSendState("sending");
    setError(null);

    try {
      const response = await fetch(
        `/api/conversas/${encodeURIComponent(selectedPhone)}/enviar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: draft })
        }
      );
      const data = (await response.json()) as SendResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Não foi possível enviar a mensagem.");
      }

      setDraft("");
      setSendState("sent");
      await requestTimeline(selectedPhone, false);
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Não foi possível enviar a mensagem."
      );
      setSendState("error");
    }
  }

  return (
    <div className="inboxPanel">
      <div className="inboxIntro">
        <div>
          <p className="eyebrow">Caixa de entrada</p>
          <h2>Conversas iniciadas pelos leads</h2>
          <p>
            As mensagens recebidas após a ativação do webhook ficam persistidas
            no CRM. A atualização ocorre por consulta periódica e não marca o
            chat como lido no WhatsApp.
          </p>
        </div>
        <button
          className="secondaryButton"
          type="button"
          onClick={() => void requestChats(true)}
          disabled={listState === "loading"}
        >
          {listState === "loading" ? "Atualizando…" : "Atualizar lista"}
        </button>
      </div>

      <div className="inboxFilters" role="group" aria-label="Filtrar conversas">
        <FilterButton active={filter === "individual"} onClick={() => setFilter("individual")}>
          Individuais
        </FilterButton>
        <FilterButton active={filter === "unread"} onClick={() => setFilter("unread")}>
          Não lidas
        </FilterButton>
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
          Todos os chats
        </FilterButton>
        <FilterButton active={filter === "group"} onClick={() => setFilter("group")}>
          Grupos
        </FilterButton>
      </div>

      {error ? (
        <div className="inboxState inboxStateError" role="alert">
          <strong>Não foi possível concluir a operação.</strong>
          <span>{error}</span>
          <button className="secondaryButton" type="button" onClick={() => setError(null)}>
            Fechar aviso
          </button>
        </div>
      ) : null}

      {listState === "loading" && <div className="inboxState">Consultando conversas…</div>}

      {listState === "ready" && visibleChats.length === 0 && (
        <div className="inboxState">
          <strong>Nenhuma conversa nesta visão.</strong>
          <span>Quando um lead iniciar contato, o chat aparecerá aqui.</span>
        </div>
      )}

      {listState === "ready" && visibleChats.length > 0 && (
        <div className="inboxWorkspace">
          <div className="inboxChatList" aria-label="Lista de conversas">
            {visibleChats.map((chat) => (
              <button
                className={`inboxChatItem${selectedPhone === chat.phone ? " inboxChatItemActive" : ""}`}
                key={chat.phone}
                type="button"
                onClick={() => selectChat(chat)}
                disabled={chat.isGroup}
              >
                <span className="inboxChatIdentity">
                  <strong>{chat.name || "Sem nome"}</strong>
                  <small>{chat.phone}</small>
                </span>
                <span className="inboxChatMeta">
                  {chat.unread > 0 || chat.messagesUnread > 0 ? (
                    <span className="inboxUnread">{chat.unread || chat.messagesUnread}</span>
                  ) : null}
                  <small>{formatChatTime(chat.lastMessageAt)}</small>
                </span>
              </button>
            ))}
          </div>

          <section className="inboxConversation" aria-label="Conversa selecionada">
            {!selectedChat ? (
              <div className="inboxConversationEmpty">
                <strong>Selecione uma conversa individual</strong>
                <span>O histórico e o campo de resposta aparecerão aqui.</span>
              </div>
            ) : (
              <>
                <header className="inboxConversationHeader">
                  <div>
                    <p className="eyebrow">Contato selecionado</p>
                    <h3>{selectedChat.name || "Sem nome"}</h3>
                    <span>{selectedChat.phone}</span>
                  </div>
                  <div className="inboxConversationContext">
                    <span>{conversation?.leadId ? "Lead vinculado" : "Contato ainda não vinculado a lead"}</span>
                    <span>{conversation?.sourceChannel ?? "WhatsApp inbound"}</span>
                    {conversation?.sourceDetail ? <span>Origem: {conversation.sourceDetail}</span> : null}
                    {conversation?.campaign ? <span>Campanha: {conversation.campaign}</span> : null}
                  </div>
                </header>

                <div className="inboxPolicyNotice">
                  Resposta manual pelo número conectado · somente texto
                </div>

                <div className="inboxTimeline" aria-live="polite">
                  {timelineState === "loading" && <div className="inboxConversationEmpty">Carregando histórico…</div>}
                  {timelineState === "error" && <div className="inboxConversationEmpty">Não foi possível carregar o histórico.</div>}
                  {timelineState === "ready" && messages.length === 0 && (
                    <div className="inboxConversationEmpty">Nenhuma mensagem persistida ainda.</div>
                  )}
                  {messages.map((message) => (
                    <article
                      className={`inboxMessage inboxMessage${message.direction === "outbound" ? "Outbound" : "Inbound"}`}
                      key={message.id}
                    >
                      <p>{message.body}</p>
                      <span>
                        {formatChatTime(message.occurredAt)}
                        {message.direction === "outbound" && message.status ? ` · ${message.status}` : ""}
                      </span>
                    </article>
                  ))}
                </div>

                <form className="inboxComposer" onSubmit={submitMessage}>
                  <label htmlFor="whatsapp-message">Resposta em texto</label>
                  <textarea
                    id="whatsapp-message"
                    maxLength={4000}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Digite uma resposta individual"
                    rows={3}
                    value={draft}
                  />
                  <div className="inboxComposerFooter">
                    <span>{draft.length}/4000</span>
                    <button className="primaryLinkButton" type="submit" disabled={!draft.trim() || sendState === "sending"}>
                      {sendState === "sending" ? "Enviando…" : sendState === "sent" ? "Enviada" : "Enviar"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`inboxFilterButton${active ? " inboxFilterButtonActive" : ""}`}
      type="button"
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function formatChatTime(value: string | null): string {
  if (!value) return "Sem registro";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem registro";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}
