# CRM Funnel Metrics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with review checkpoints.

**Goal:** Record conversation and lead stage transitions and expose reliable inbound funnel metrics for routine management and future target projections.

**Architecture:** Add a Supabase event ledger with database triggers so webhook inserts, conversation status changes, lead creation and lead stage changes are captured independently of the UI path. Add pure TypeScript metric calculations over conversation snapshots, lead snapshots, events and WhatsApp messages; the dashboard will render counts, rates and response backlog without inventing targets.

**Tech Stack:** Next.js App Router, TypeScript, Supabase PostgreSQL, Vitest, existing CRM dashboard and design tokens.

## Global Constraints

- Count unique conversations, contacts, leads and negotiations; never count raw messages as funnel entities.
- `Engano` and `Spam` are excluded from valid contacts; `Sem interesse` remains a real contact but not a qualified opportunity.
- A period metric must define its cohort by the conversation creation date.
- Current snapshots may be shown, but historical stage conversion requires event history.
- Rates with a zero denominator must be represented as not calculable, not 0%.
- Do not invent targets, conversion rates or revenue results.
- Preserve existing authentication, WhatsApp sending and lead CRUD behavior.

---

### Task 1: Create the funnel event ledger

**Files:**
- Create: `supabase/migrations/20260804_add_crm_funnel_events.sql`
- Test: `src/lib/crm/funnel-events.test.ts`

**Interfaces:**
- Event types: `conversation_created`, `conversation_status_changed`, `conversation_lead_linked`, `lead_created`, `lead_stage_changed`.

- [ ] Write a failing test covering the event type guard and deterministic event key format.
- [ ] Run `npm test -- src/lib/crm/funnel-events.test.ts` and confirm red.
- [ ] Add the event table, indexes, RLS read policy and security-definer triggers for `whatsapp_conversations` and `leads`.
- [ ] Backfill one `conversation_created` event per existing conversation using `on conflict (event_key) do nothing`.
- [ ] Implement the pure event helpers and run the focused test green.
- [ ] Commit with `feat: record crm funnel events`.

### Task 2: Implement pure funnel metrics and data access

**Files:**
- Create: `src/lib/crm/funnel-metrics.ts`
- Create: `src/lib/crm/funnel-metrics.test.ts`
- Create: `src/lib/crm/funnel-metrics-repository.ts`

**Interfaces:**
- `calculateFunnelMetrics(input, period)` returns counts, rates, first-response backlog and median response time.
- `getFunnelMetrics(client, period)` reads snapshots, events and messages and delegates to the pure calculator.

- [ ] Write failing tests for the complete funnel, exclusion of mistake/spam, zero-denominator rates, stage history and first-response backlog.
- [ ] Run `npm test -- src/lib/crm/funnel-metrics.test.ts` and confirm red.
- [ ] Implement the calculator with cohort filtering by conversation creation date and unique entity IDs.
- [ ] Implement the Supabase repository with safe empty-event fallback when the new migration is not yet present.
- [ ] Run focused tests green and commit with `feat: calculate inbound funnel metrics`.

### Task 3: Expose metrics in the dashboard

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Test: `src/lib/crm/dashboard.test.ts`

- [ ] Add a failing dashboard view-model test proving the funnel metric block is exposed separately from the existing lead summary.
- [ ] Run the focused test and confirm red.
- [ ] Load the current calendar-month period in the server page and render cards for conversations, valid contacts, qualification, leads, negotiations, won and lost.
- [ ] Render conversion rates, awaiting-first-response and median first-response time without replacing the existing pipeline cards.
- [ ] Add responsive styles using existing Porto Alegre tokens.
- [ ] Run the dashboard test green, lint and build.
- [ ] Commit with `feat: show funnel metrics on crm dashboard`.

### Task 4: Document and package

**Files:**
- Create: `docs/jornada/2026-08-04-registro-metricas-funil.md`
- Create: `artifacts/crm-porto-alegre-oficial-hostinger-v10.zip`
- Modify: `D:\LEONARDO\Porto Alegre Oficial\Cofre Comercial Porto Alegre Digital\04 - CRM\Métricas do Funil e Metas.md`
- Modify: `D:\LEONARDO\Porto Alegre Oficial\Cofre Comercial Porto Alegre Digital\90 - Governança\Mapa de Entregáveis.md`

- [ ] Run `npm test`, `npm run lint`, `npm run build` and `git diff --check`.
- [ ] Record exact evidence, migration dependency and limits; do not claim production results.
- [ ] Create the v10 ZIP from the final commit and verify no `.env.local`, `node_modules` or `.next` is included.
- [ ] Commit documentation and package, then push `main` only as part of the approved project release workflow.
