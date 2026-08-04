# Conversas WhatsApp operacionais via Z-API — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar `/conversas` em uma caixa de entrada operacional, com mensagens de texto persistidas no Supabase, webhooks Z-API idempotentes e resposta manual individual pelo CRM.

**Architecture:** A camada `src/lib/whatsapp` normaliza payloads e aplica as regras de operação antes de tocar no banco. Rotas server-side autenticadas usam o cliente Supabase do servidor; webhooks usam apenas o segredo de caminho e a configuração server-side da instância. A interface permanece protegida por `requireCurrentAdmin`, carrega chats da Z-API e a linha do tempo persistida por polling, sem Realtime.

**Tech Stack:** Next.js App Router 16, React 19, TypeScript, Supabase SSR/Postgres/RLS, Z-API REST, Vitest.

## Global Constraints

- Toda resposta é manual, individual e vinculada ao contato selecionado.
- A primeira versão suporta somente texto; o corpo deve ser não vazio após `trim` e ter no máximo 4.000 caracteres.
- O telefone precisa pertencer ao chat selecionado; não existe campo livre para envio arbitrário.
- O CRM não marca, arquiva, exclui, silencia ou altera chats automaticamente.
- Tokens da Z-API permanecem exclusivamente server-side; webhooks exigem HTTPS, segredo e `instanceId` correspondente.
- Mensagens anteriores à ativação do webhook não são importadas retroativamente.
- Acesso a leitura e envio exige `requireCurrentAdmin`.
- Não testar envio real sem número de teste e mensagem explicitamente autorizados.

---

### Task 1: Domínio de mensagens e cliente Z-API

**Files:**
- Create: `src/lib/whatsapp/messages.ts`
- Test: `src/lib/whatsapp/messages.test.ts`
- Modify: `src/lib/zapi/client.ts`
- Test: `src/lib/zapi/client.test.ts`

**Interfaces:**
- `normalizeZapiMessage(payload, expectedInstanceId)` retorna uma mensagem normalizada ou erro seguro.
- `validateOutgoingText(text)` retorna `{ ok: true, text }` ou `{ ok: false, message }`.
- `createZapiClient(...).sendText(phone, message)` chama `POST /send-text` e retorna somente `messageId`/`zaapId` normalizados.

- [ ] Escrever testes que rejeitam instância divergente, evento sem `messageId`, evento sem `phone`, mensagem não textual, texto vazio e texto acima de 4.000 caracteres.
- [ ] Executar `npm test -- src/lib/whatsapp/messages.test.ts src/lib/zapi/client.test.ts --run` e confirmar falha por módulos ausentes/método ausente.
- [ ] Implementar normalização somente dos campos `instanceId`, `messageId`, `phone`, `chatName`, `fromMe`, `status`, `momment` e `text.message`; converter `momment` em ISO e descartar payload bruto.
- [ ] Implementar `sendText` com `Content-Type: application/json`, `Client-Token`, corpo `{ phone, message }` e erro genérico sem detalhes do provedor.
- [ ] Executar os mesmos testes e confirmar aprovação.

### Task 2: Persistência Supabase e RLS

**Files:**
- Create: `supabase/migrations/20260730_add_whatsapp_conversations.sql`
- Create: `src/lib/whatsapp/repository.ts`
- Test: `src/lib/whatsapp/repository.test.ts`

**Interfaces:**
- `upsertConversationAndMessage(client, input)` faz upsert por `(instance_id, phone)` e insere por `(instance_id, provider_message_id)`.
- `listConversationMessages(client, instanceId, phone)` retorna mensagens ordenadas por `occurred_at` ascendente.
- `isSelectedChatPhone(chats, phone)` garante que o número veio da lista de chats autorizada.

- [ ] Escrever testes com um gateway Supabase falso para verificar upsert da conversa, idempotência de mensagem, ordenação e bloqueio de telefone não selecionado.
- [ ] Executar o teste e confirmar falha antes da implementação.
- [ ] Criar as tabelas `whatsapp_conversations` e `whatsapp_messages`, a restrição única solicitada, índices por conversa/tempo e RLS que permita leitura apenas a administradores autenticados.
- [ ] Implementar o repositório sem armazenar tokens ou payload bruto; tratar conflito de mensagem repetida como sucesso idempotente.
- [ ] Executar testes unitários e validar a migração SQL por leitura/revisão.

### Task 3: Webhooks HTTPS protegidos

**Files:**
- Create: `src/lib/whatsapp/webhook.ts`
- Test: `src/lib/whatsapp/webhook.test.ts`
- Create: `src/app/api/webhooks/zapi/received/[secret]/route.ts`
- Create: `src/app/api/webhooks/zapi/delivery/[secret]/route.ts`

**Interfaces:**
- `processZapiWebhook(secret, expectedSecret, expectedInstanceId, payload, repository)` valida segredo, instância e formato antes de persistir.
- Ambas as rotas respondem `200 { ok: true }` em evento aceito/repetido; rejeitam segredo/instância/formato inválido sem persistência.

- [ ] Escrever testes para segredo ausente/incorreto, instância divergente, payload inválido, recebimento inbound e delivery outbound.
- [ ] Executar testes e confirmar falha.
- [ ] Implementar rotas POST dinâmicas com `runtime = "nodejs"`, leitura JSON segura e mensagens/logs genéricos.
- [ ] Usar `ZAPI_WEBHOOK_SECRET` e `readZapiConfig()` somente no servidor; nunca enviar credenciais ao navegador.
- [ ] Persistir apenas mensagens de texto; ignorar eventos de áudio, mídia, grupos de notificações e payloads sem texto com resposta aceita/idempotente.
- [ ] Executar testes e confirmar que nenhum segredo ou payload integral aparece no resultado/log.

### Task 4: APIs protegidas da timeline e envio

**Files:**
- Create: `src/app/api/conversas/[phone]/mensagens/route.ts`
- Create: `src/app/api/conversas/[phone]/enviar/route.ts`
- Create: `src/lib/whatsapp/conversation-service.ts`
- Test: `src/lib/whatsapp/conversation-service.test.ts`

**Interfaces:**
- `GET /api/conversas/[phone]/mensagens` exige administrador e lista mensagens persistidas.
- `POST /api/conversas/[phone]/enviar` exige administrador, recebe `{ message }`, valida o chat selecionado e chama `send-text`.
- A resposta de envio retorna estado genérico e `messageId` apenas quando fornecido pela Z-API; a confirmação final continua no webhook de delivery.

- [ ] Escrever testes para texto válido, vazio, acima do limite, telefone não selecionado e falha do provedor.
- [ ] Executar testes e confirmar falha.
- [ ] Implementar o serviço com a lista de chats Z-API como fonte de autorização do telefone, sem aceitar número arbitrário.
- [ ] Proteger ambas as rotas com `requireCurrentAdmin`, converter erros para respostas seguras e não realizar envio automático.
- [ ] Executar testes e confirmar aprovação.

### Task 5: Interface operacional `/conversas`

**Files:**
- Modify: `src/app/conversas/page.tsx`
- Modify: `src/app/conversas/WhatsAppInboxPanel.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- A lista seleciona um chat individual sem marcar como lido.
- O painel exibe cabeçalho, mensagens inbound/outbound, status e composer de texto.
- Polling atualiza lista e conversa aberta em poucos segundos, com cancelamento no unmount.

- [ ] Implementar estado de chat selecionado, timeline, composer, contador 0/4000, estados `Enviando…`, `Enviada` e erro recuperável.
- [ ] Exibir aviso permanente `Resposta manual pelo número conectado · somente texto`.
- [ ] Bloquear envio quando não houver chat selecionado ou texto inválido; nunca renderizar credenciais Z-API.
- [ ] Tornar lista e timeline empilháveis em telas pequenas e manter filtros existentes.
- [ ] Verificar manualmente a navegação autenticada, a seleção e o comportamento de erro sem fazer envio real.

### Task 6: Configuração operacional, validação e entrega

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `supabase/README.md`

- [ ] Documentar `ZAPI_WEBHOOK_SECRET` e as duas URLs HTTPS que devem ser cadastradas na instância Z-API, sem incluir valores reais.
- [ ] Documentar que o histórico anterior ao webhook não é garantido e que mensagens só de mídia ficam fora da V1.
- [ ] Executar `npm test -- --run`, `npm run lint` e `npm run build`.
- [ ] Revisar cada critério de aceite da especificação, o diff e os arquivos sensíveis antes de qualquer commit/deploy.

