# Agenda da Rotina Imediata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Derivar a agenda da Visão Geral das próximas ações com data e hora registradas nos leads, mantendo vencidos visíveis e links para os cadastros.

**Architecture:** Um helper puro transforma `Lead[]` em itens de agenda determinísticos, filtrando registros incompletos, derivando prioridade pela proximidade da data e ordenando por horário. A página server-side passa os leads já carregados para esse helper; a UI renderiza ação, empresa, etapa e horário, com link para o lead.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase, Vitest, CSS global existente e Obsidian Flavored Markdown.

## Global Constraints

- A fonte da agenda é `next_action` + `next_action_at` do lead.
- Registros vencidos permanecem visíveis e são classificados como `Vencida`.
- Não criar tabela de tarefas, notificações, automações ou integração com calendários externos.
- Não alterar as etapas oficiais do funil nem as métricas do dashboard.
- Não expor credenciais, dados de acesso ou dados pessoais novos na documentação.

---

### Task 1: Criar o modelo puro da agenda

**Files:**
- Create: `src/lib/crm/immediate-routine.ts`
- Create: `src/lib/crm/immediate-routine.test.ts`

**Interfaces:**
- `ImmediateRoutineItem` expõe `id`, `leadId`, `companyName`, `title`, `stage`, `dueAt`, `priority` e `status`.
- `buildImmediateRoutine(leads: Lead[], referenceDate?: Date): ImmediateRoutineItem[]` retorna itens válidos ordenados por `dueAt` crescente.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { buildImmediateRoutine } from "./immediate-routine";
import type { Lead } from "./types";

const lead = (overrides: Partial<Lead>): Lead => ({
  id: "lead-1",
  companyName: "Empresa A",
  contactName: "Pessoa A",
  segment: "Serviços",
  source: "Inbound",
  stage: "Negociação",
  owner: "Leonardo",
  estimatedValue: 5000,
  probability: 60,
  nextAction: "Responder lead",
  nextActionAt: "2026-08-04T14:00:00.000Z",
  createdAt: "2026-08-01T12:00:00.000Z",
  updatedAt: "2026-08-01T12:00:00.000Z",
  ...overrides
});

describe("buildImmediateRoutine", () => {
  it("inclui todas as ações válidas e ordena as mais próximas primeiro", () => {
    const items = buildImmediateRoutine(
      [
        lead({ id: "later", nextActionAt: "2026-08-06T14:00:00.000Z" }),
        lead({ id: "overdue", nextActionAt: "2026-08-03T14:00:00.000Z" }),
        lead({ id: "soon", nextActionAt: "2026-08-04T14:00:00.000Z" })
      ],
      new Date("2026-08-04T10:00:00.000Z")
    );

    expect(items.map((item) => item.leadId)).toEqual(["overdue", "soon", "later"]);
    expect(items[0]).toMatchObject({ status: "overdue", priority: "Alta" });
    expect(items[1]).toMatchObject({ status: "upcoming", priority: "Alta" });
    expect(items[2]).toMatchObject({ status: "upcoming", priority: "Baixa" });
  });

  it("ignora ação vazia e data inválida", () => {
    const items = buildImmediateRoutine([
      lead({ id: "empty", nextAction: "   " }),
      lead({ id: "invalid", nextActionAt: "data inválida" })
    ]);

    expect(items).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/crm/immediate-routine.test.ts`

Expected: FAIL because `src/lib/crm/immediate-routine.ts` does not exist.

- [ ] **Step 3: Write minimal implementation**

Implement the exported interface and helper. Use `new Date(value).getTime()` to validate dates, trim the action, set `status` to `overdue` when `dueAt < referenceDate`, and derive priority from the millisecond difference. Return only valid items sorted by `dueAt`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/crm/immediate-routine.test.ts`

Expected: PASS.

### Task 2: Integrar a agenda na Visão Geral

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/page-structure.test.ts`

**Interfaces:**
- `Home` chama `buildImmediateRoutine(leads, referenceDate)` usando a mesma coleção de leads já escolhida entre Supabase e fallback.
- A seção mantém o id `rotina` e renderiza cada `ImmediateRoutineItem` com `<time dateTime>` e link opcional para `/leads/[id]`.

- [ ] **Step 1: Write the failing test**

Adicionar uma asserção estrutural que confirme que a Visão Geral importa o helper, usa `buildImmediateRoutine` e renderiza `dateTime`/`Rotina imediata`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/page-structure.test.ts`

Expected: FAIL because the page still consumes `mockTasks` and does not render agenda items derivadas dos leads.

- [ ] **Step 3: Write minimal implementation**

Remover a dependência de `mockTasks` em `src/app/page.tsx`, calcular `routineItems`, importar `Link` e `buildImmediateRoutine`, e substituir cada artigo da agenda por uma renderização que mostre prioridade, status, ação, empresa, etapa e data/hora completa. Renderizar um estado vazio quando `routineItems.length === 0`. Adicionar estilos para link, metadados, status vencido e leitura mobile sem alterar os demais blocos.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/app/page-structure.test.ts src/lib/crm/immediate-routine.test.ts`

Expected: PASS.

### Task 3: Documentar a decisão operacional

**Files:**
- Create: `docs/jornada/2026-08-04-registro-agenda-rotina-imediata.md`
- Modify: `Cofre Comercial Porto Alegre Digital/04 - CRM/Registro de Implementação — Métricas e Meta Mensal.md`
- Modify: `Cofre Comercial Porto Alegre Digital/90 - Governança/Mapa de Entregáveis.md`

- [ ] **Step 1: Registrar o estado factual**

Documentar fonte dos dados, regra de inclusão/ordenação/prioridade, arquivos alterados, testes executados, ausência de tabela de tarefas e dependência das migrations do Supabase. Usar wikilinks internos no cofre.

- [ ] **Step 2: Conferir limites de publicação**

Classificar como interno os detalhes de rotas autenticadas, Supabase e operação comercial; não inserir credenciais, URLs privadas ou dados pessoais.

### Task 4: Validar e entregar

**Files:**
- Create: `artifacts/crm-porto-alegre-oficial-hostinger-v15.zip`

- [ ] **Step 1: Run the full verification suite**

Run: `npm test; npm run lint; npm run build; git diff --check`

Expected: all tests, lint, build and whitespace checks pass.

- [ ] **Step 2: Package without secrets**

Run: `git archive --format=zip --output=artifacts/crm-porto-alegre-oficial-hostinger-v15.zip HEAD` after committing the implementation, then verify the archive has no `.env.local`, `node_modules` or `.next`.

- [ ] **Step 3: Commit and push**

```powershell
git add src/lib/crm/immediate-routine.ts src/lib/crm/immediate-routine.test.ts src/app/page.tsx src/app/globals.css src/app/page-structure.test.ts docs/superpowers/specs/2026-08-04-crm-agenda-rotina-imediata-design.md docs/superpowers/plans/2026-08-04-crm-agenda-rotina-imediata.md docs/jornada/2026-08-04-registro-agenda-rotina-imediata.md "Cofre Comercial Porto Alegre Digital/04 - CRM/Registro de Implementação — Métricas e Meta Mensal.md" "Cofre Comercial Porto Alegre Digital/90 - Governança/Mapa de Entregáveis.md"
git commit -m "feat: build immediate routine agenda from leads"
git push origin main
```

