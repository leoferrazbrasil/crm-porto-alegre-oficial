# CRM Leads CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Supabase-backed CRUD for CRM leads.

**Architecture:** Add pure mapping/validation helpers, a Supabase server repository, protected lead pages, and server actions. The dashboard will use persisted leads first and mock leads only as a fallback.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase SSR, TypeScript, Vitest.

## Global Constraints

- Use authenticated Supabase SSR sessions only.
- Do not use `service_role` or secret keys.
- Keep Instagram manual only.
- Do not add WhatsApp, Instagram API, scraping, or message automation.
- Keep this phase limited to core lead CRUD fields.
- Run `npm test`, `npm run lint`, and `npm run build` before completion.

---

### Task 1: Lead Mapping And Validation

**Files:**
- Create: `src/lib/crm/leads.ts`
- Create: `src/lib/crm/leads.test.ts`

**Interfaces:**
- Produces: `mapLeadRow(row: LeadRow): Lead`
- Produces: `parseLeadForm(formData: FormData): LeadFormResult`
- Produces: `buildLeadPayload(input: ValidLeadInput, ownerId: string): LeadPayload`

- [ ] Write failing tests for row mapping and required fields.
- [ ] Run `npm test -- src/lib/crm/leads.test.ts` and confirm failure.
- [ ] Implement mapping, validation, and payload creation.
- [ ] Run the focused test and confirm success.

### Task 2: Supabase Repository And Actions

**Files:**
- Create: `src/lib/crm/leads-repository.ts`
- Create: `src/app/leads/actions.ts`
- Create: `src/app/leads/actions.test.ts`

**Interfaces:**
- Produces: `listLeads(client): Promise<Lead[]>`
- Produces: `getLead(client, id): Promise<Lead | null>`
- Produces: `createLeadAction(previousState, formData)`
- Produces: `updateLeadAction(previousState, formData)`
- Produces: `deleteLeadAction(formData)`

- [ ] Write failing tests for action helpers with dependency-injected clients.
- [ ] Run focused tests and confirm failure.
- [ ] Implement repository and server actions.
- [ ] Run focused tests and confirm success.

### Task 3: Lead Pages

**Files:**
- Create: `src/app/leads/page.tsx`
- Create: `src/app/leads/novo/page.tsx`
- Create: `src/app/leads/[id]/page.tsx`
- Create: `src/app/leads/LeadForm.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/perfil/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `requireCurrentAdmin()`
- Consumes: `listLeads`, `getLead`
- Consumes: lead server actions.

- [ ] Add `/leads` table with link to new lead and detail edit pages.
- [ ] Add `/leads/novo` create form.
- [ ] Add `/leads/[id]` edit/delete form.
- [ ] Add sidebar navigation to `Leads`.
- [ ] Add compact CRM styles.

### Task 4: Dashboard Real Data

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `listLeads`
- Consumes: existing `buildDashboardViewModel`

- [ ] Load Supabase leads for the dashboard.
- [ ] Use mock leads only when the persisted list is empty or unavailable.
- [ ] Keep existing mock tasks until the tasks CRUD phase.

### Task 5: Validation And Release

**Files:**
- All modified source, tests, docs.

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Stage only CRM lead CRUD files.
- [ ] Commit with `feat: adicionar CRUD de leads`.
- [ ] Push `main` to GitHub.

## Self-Review

- Spec coverage: list, create, edit, delete, dashboard real data, Supabase mapping, and manual Instagram-only scope are covered.
- Placeholder scan: no implementation placeholder is intentionally left.
- Type consistency: `Lead`, `LeadRow`, `LeadPayload`, `parseLeadForm`, and server action names are consistent.
