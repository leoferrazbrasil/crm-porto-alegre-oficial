# Conversão contextual de conversa em lead — Plano de Implementação

> **Para trabalhadores agentic:** REQUIRED SUB-SKILL: Use superpowers:executing-plans para executar este plano tarefa por tarefa. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** adicionar conversão manual de uma conversa em lead por meio de um painel curto, mantendo o operador dentro do atendimento.

**Architecture:** A regra de domínio continuará no módulo de qualificação e a mutação transacional existente será exposta pelo endpoint de lead. A caixa de entrada controlará somente a abertura, envio e estados visuais do painel; o servidor continuará responsável por validar, criar e vincular.

**Tech Stack:** Next.js App Router, React, TypeScript, Supabase, Vitest e CSS existente do CRM.

## Global Constraints

- Conversas em `Novo` e `Qualificando` não criam lead automaticamente.
- A conversão fica disponível em `Negociação` sem lead vinculado.
- Nome, telefone, canal e campanha são herdados e somente leitura.
- Empresa, segmento, próxima ação e data da próxima ação são obrigatórios.
- O sucesso mantém o operador na conversa.
- Não adicionar biblioteca externa de modal ou formulário.

---

### Task 1: Regra de conversão e payload

**Files:**
- Modify: `src/lib/whatsapp/qualification.ts`
- Modify: `src/lib/whatsapp/qualification.test.ts`

**Interfaces:**
- `canConvertConversation(conversation)` retorna `true` somente para `negotiation` sem `leadId`.
- `validateLeadConversion(conversation, input)` exige empresa e segmento e mantém a regra de vínculo único.
- `buildLeadPayloadFromConversation(...)` cria lead na etapa `Negociação`.

- [x] Escrever/ajustar testes para conversão em `Negociação`, rejeição de `Novo` e payload com etapa correta.
- [x] Executar o teste da qualificação e confirmar a falha antes da implementação.
- [x] Implementar a regra mínima e manter a validação server-side.
- [x] Executar o teste novamente e confirmar aprovação.

### Task 2: Endpoint e teste de mutação

**Files:**
- Inspect/Modify: `src/app/api/conversas/[phone]/lead/route.ts`
- Modify: `src/lib/whatsapp/qualification.ts`
- Modify: `src/lib/whatsapp/repository.ts` somente se a resposta precisar de dados adicionais.

**Interfaces:**
- `POST /api/conversas/[phone]/lead` recebe `{ companyName, segment }`.
- Resposta de sucesso contém `{ ok: true, leadId }`; erros retornam `{ ok: false, message }`.

- [x] Cobrir o contrato de sucesso/erro no teste de qualificação ou endpoint existente.
- [x] Confirmar que falha de vínculo remove o lead criado, evitando conversão parcial.
- [x] Manter a resposta sem expor credenciais ou dados internos.

### Task 3: Painel de conversão na caixa de entrada

**Files:**
- Modify: `src/app/conversas/WhatsAppInboxPanel.tsx`
- Modify: `src/app/globals.css`
- Create/Modify: `src/app/conversas/WhatsAppInboxPanel.test.tsx` somente se o ambiente suportar renderização; caso contrário, cobrir o contrato por funções e build.

**Interfaces:**
- Estado local do painel: fechado, aberto, enviando, sucesso e erro.
- Campos: `companyName`, `segment`, `nextAction`, `nextActionAt`.
- Dados herdados são apresentados como leitura.

- [x] Criar teste de contrato para o botão e os estados do painel.
- [x] Executar o teste para confirmar a ausência do comportamento.
- [x] Implementar o painel sem remover o histórico ou o composer da conversa.
- [x] Implementar foco, cancelar, Escape, labels e bloqueio de duplo envio.
- [x] Após sucesso, atualizar a conversa e oferecer `Abrir lead`.
- [x] Executar testes e validar o comportamento responsivo por build.

### Task 4: Documentação, cofre e entrega

**Files:**
- Create: `docs/jornada/2026-08-04-registro-conversao-conversa-lead.md`
- Modify: `Cofre Comercial Porto Alegre Digital/04 - CRM/Registro de Implementação — Funil de Vendas.md`
- Modify: `Cofre Comercial Porto Alegre Digital/90 - Governança/Mapa de Entregáveis.md`
- Create: `artifacts/crm-porto-alegre-oficial-hostinger-v14.zip`

- [x] Registrar a decisão e os limites factuais.
- [x] Executar `npm test`, `npm run lint`, `npm run build` e `git diff --check`.
- [x] Gerar pacote sem `.env.local`.
- [x] Commitar somente os arquivos desta etapa e fazer push na `main`.
