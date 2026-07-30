"use client";

import { useEffect, useMemo, useState } from "react";

import type { ZapiChat } from "@/lib/zapi/client";

type Filter = "all" | "unread" | "individual" | "group";

interface ChatsResponse {
  ok: boolean;
  chats?: ZapiChat[];
  message?: string;
}

export function WhatsAppInboxPanel() {
  const [chats, setChats] = useState<ZapiChat[]>([]);
  const [filter, setFilter] = useState<Filter>("individual");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  async function requestChats() {
    setError(null);

    try {
      const response = await fetch("/api/zapi/chats?page=1&pageSize=50", {
        cache: "no-store"
      });
      const data = (await response.json()) as ChatsResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Não foi possível carregar as conversas.");
      }

      setChats(data.chats ?? []);
      setState("ready");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar as conversas."
      );
      setState("error");
    }
  }

  async function loadChats() {
    setState("loading");
    await requestChats();
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void requestChats();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const visibleChats = useMemo(
    () =>
      chats
        .filter((chat) => {
          if (filter === "unread") return chat.unread > 0 || chat.messagesUnread > 0;
          if (filter === "individual") return !chat.isGroup;
          if (filter === "group") return chat.isGroup;
          return true;
        })
        .sort((first, second) => {
          if (first.unread !== second.unread) return second.unread - first.unread;
          return (second.lastMessageAt ?? "").localeCompare(first.lastMessageAt ?? "");
        }),
    [chats, filter]
  );

  return (
    <div className="inboxPanel">
      <div className="inboxIntro">
        <div>
          <p className="eyebrow">Caixa de entrada</p>
          <h2>Chats recentes</h2>
          <p>
            A lista é atualizada sob demanda e não altera o estado do WhatsApp.
            O conteúdo completo das mensagens será adicionado com a etapa de
            webhooks e persistência segura no Supabase.
          </p>
        </div>
        <button className="secondaryButton" type="button" onClick={() => void loadChats()} disabled={state === "loading"}>
          {state === "loading" ? "Atualizando…" : "Atualizar lista"}
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

      {state === "loading" && <div className="inboxState">Consultando conversas…</div>}

      {state === "error" && (
        <div className="inboxState inboxStateError" role="alert">
          <strong>Não foi possível carregar a caixa de entrada.</strong>
          <span>{error}</span>
          <button className="secondaryButton" type="button" onClick={() => void loadChats()}>
            Tentar novamente
          </button>
        </div>
      )}

      {state === "ready" && visibleChats.length === 0 && (
        <div className="inboxState">
          <strong>Nenhuma conversa nesta visão.</strong>
          <span>Quando um lead iniciar contato, o chat aparecerá aqui.</span>
        </div>
      )}

      {state === "ready" && visibleChats.length > 0 && (
        <div className="tableWrap inboxTableWrap">
          <table className="inboxTable">
            <thead>
              <tr>
                <th>Contato</th>
                <th>Última interação</th>
                <th>Não lidas</th>
                <th>Estado</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {visibleChats.map((chat) => (
                <tr key={chat.phone}>
                  <td>
                    <strong>{chat.name || "Sem nome"}</strong>
                    <span>{chat.phone}</span>
                  </td>
                  <td>{formatChatTime(chat.lastMessageAt)}</td>
                  <td>
                    <span className={chat.unread > 0 ? "inboxUnread" : "inboxRead"}>
                      {chat.unread}
                    </span>
                  </td>
                  <td>
                    <div className="inboxFlags">
                      {chat.isGroup ? <span>Grupo</span> : <span>Individual</span>}
                      {chat.pinned && <span>Fixado</span>}
                      {chat.isMuted && <span>Silenciado</span>}
                      {chat.archived && <span>Arquivado</span>}
                      {chat.isMarkedSpam && <span>Spam</span>}
                    </div>
                  </td>
                  <td>
                    <span className="inboxReadOnly">Somente leitura</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
