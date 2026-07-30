# CRM Local Porto Alegre Oficial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first local operational CRM for Porto Alegre Oficial with mock data, Supabase-ready boundaries, and a branded dashboard for Leonardo to operate while the owner has read-only visibility.

**Architecture:** The app is a Next.js App Router project with a typed local domain layer, mock repository for local operation, and Supabase client/schema files prepared for future production persistence. The first UI is a dense operational dashboard: KPIs, pipeline, leads, tasks, goals, and read-only owner context.

**Tech Stack:** Next.js, React, TypeScript, Supabase JS client, Vitest, CSS modules/global CSS using Porto Alegre Oficial design tokens.

## Global Constraints

- Project path: `D:\LEONARDO\Porto Alegre Oficial\crm`.
- CRM ownership model: Leonardo operates; the owner follows in read-only mode.
- No direct Instagram integration in V1.
- Instagram-originated leads are manual records only.
- Supabase is prepared, but local V1 runs with mock data until production credentials are available.
- Brand must follow Porto Alegre Oficial Design System: white canvas, graphite text, black contrast, sparse logo-ruler accents, Archivo for headings, Inter for body.
- Do not add prices, contracts, WhatsApp automation, cold DMs, or external publishing flows in V1.

---

### Task 1: Project Foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `vitest.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`

**Interfaces:**
- Produces: a runnable Next.js local project with `npm run dev`, `npm run test`, `npm run lint`, and `npm run build`.

- [x] **Step 1: Create project config files**
- [x] **Step 2: Install dependencies**
- [x] **Step 3: Add base app shell**
- [x] **Step 4: Run initial validation**

### Task 2: CRM Domain Model

**Files:**
- Create: `src/lib/crm/types.ts`
- Create: `src/lib/crm/pipeline.ts`
- Create: `src/lib/crm/metrics.ts`
- Create: `src/lib/crm/mock-data.ts`
- Test: `src/lib/crm/metrics.test.ts`

**Interfaces:**
- Produces: `Lead`, `PipelineStage`, `CrmSummary`, `calculateCrmSummary(leads)`, `groupLeadsByStage(leads)`.

- [x] **Step 1: Write failing metric tests**
- [x] **Step 2: Implement typed CRM model and metrics**
- [x] **Step 3: Add mock leads and tasks**
- [x] **Step 4: Run tests**

### Task 3: Supabase Preparation

**Files:**
- Create: `.env.example`
- Create: `src/lib/supabase/client.ts`
- Create: `supabase/schema.sql`
- Create: `supabase/README.md`

**Interfaces:**
- Produces: environment variable contract and SQL schema aligned to the local domain model.

- [x] **Step 1: Define environment variable contract**
- [x] **Step 2: Create Supabase browser client helper**
- [x] **Step 3: Create initial SQL schema with RLS-ready roles**
- [x] **Step 4: Document local vs production mode**

### Task 4: Branded Operational UI

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `mockLeads`, `mockTasks`, `calculateCrmSummary`, `groupLeadsByStage`.
- Produces: first local CRM screen for dashboard, pipeline, lead table, activities, goals, and owner read-only context.

- [x] **Step 1: Build dashboard structure**
- [x] **Step 2: Build pipeline and lead table**
- [x] **Step 3: Build commercial routine and goals panels**
- [x] **Step 4: Validate responsive layout**

### Task 5: Handoff

**Files:**
- Create: `README.md`
- Create: `src/lib/crm/fields.ts`

**Interfaces:**
- Produces: clear local run instructions and a mapped list of CRM fields from the approved CSV.

- [x] **Step 1: Add README runbook**
- [x] **Step 2: Add field dictionary source module**
- [x] **Step 3: Run tests, lint, and build**
- [x] **Step 4: Start local dev server**
