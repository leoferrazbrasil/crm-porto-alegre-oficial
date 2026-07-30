# Z-API WhatsApp Inbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir no CRM a lista de conversas do WhatsApp conectado via Z-API para que Leonardo acompanhe leads que iniciaram contato.

**Architecture:** O servidor consulta a Z-API com credenciais server-side e expõe uma rota autenticada que retorna apenas dados normalizados. Uma tela cliente carrega essa rota, filtra localmente chats individuais/grupos e não oferece mutações. O histórico completo ficará para uma etapa posterior baseada em webhooks e Supabase.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Z-API REST API.

## Global Constraints

- A V1 é somente leitura: sem envio, auto-read, arquivamento ou exclusão.
- Nunca usar `NEXT_PUBLIC_` para credenciais da Z-API.
- Grupos ficam ocultos por padrão; a operação prioriza conversas iniciadas por leads.
- Erros do provedor não podem vazar tokens, payloads ou detalhes brutos.

---

### Task 1: Cliente Z-API e normalização

**Files:**
- Modify: `src/lib/zapi/client.ts`
- Test: `src/lib/zapi/client.test.ts`

**Interfaces:**
- Produces `ZapiClient.getChats(page?: number, pageSize?: number): Promise<ZapiChatsResult>`.
- `ZapiChatsResult` retorna `{ ok: true, chats, page, pageSize }` ou `{ ok: false, message }`.

- [ ] **Step 1: Escrever testes falhando** para URL/query/header, normalização de flags/timestamp e erro seguro.
- [ ] **Step 2: Executar `npm test -- src/lib/zapi/client.test.ts` e confirmar falha pela ausência de `getChats`.
- [ ] **Step 3: Implementar tipos, conversão de valores Z-API e `getChats` mínimo.
- [ ] **Step 4: Executar o teste focado e confirmar aprovação.

### Task 2: Rota autenticada de chats

**Files:**
- Create: `src/app/api/zapi/chats/route.ts`
- Test: `src/app/api/zapi/chats/route.test.ts` se a infraestrutura de rota permitir teste isolado.

**Interfaces:**
- `GET /api/zapi/chats?page=1&pageSize=50` exige `requireCurrentAdmin`, valida paginação, lê `readZapiConfig` e chama `createZapiClient`.

- [ ] **Step 1: Escrever teste de contrato para defaults/limite de paginação e erro sem credenciais.
- [ ] **Step 2: Confirmar o teste falhando antes da implementação.
- [ ] **Step 3: Implementar a rota com status 200, 400 e 502 seguros.
- [ ] **Step 4: Executar testes focados e confirmar aprovação.

### Task 3: Inbox protegida e navegação

**Files:**
- Create: `src/app/conversas/page.tsx`
- Create: `src/app/conversas/WhatsAppInboxPanel.tsx`
- Modify: páginas protegidas para incluir link `/conversas`.
- Modify: `src/app/globals.css`

**Interfaces:**
- O painel cliente consome somente `/api/zapi/chats`, apresenta estados loading/erro/vazio e filtros locais.

- [ ] **Step 1: Implementar painel e página com a identidade visual existente.
- [ ] **Step 2: Adicionar navegação consistente e estilos responsivos.
- [ ] **Step 3: Executar lint/build e revisar que não há ação de envio/mutação.

### Task 4: Documentação e entrega

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Documentar endpoint interno, escopo somente leitura e próxima etapa de webhook.
- [ ] **Step 2: Executar `npm test`, `npm run lint` e `npm run build` completos.
- [ ] **Step 3: Revisar `git diff`, fazer commit `feat: exibir conversas whatsapp zapi` e push para `origin main`.
