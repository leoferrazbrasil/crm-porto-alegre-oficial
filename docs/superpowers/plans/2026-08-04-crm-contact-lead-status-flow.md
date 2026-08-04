# CRM Contact-to-Lead Status Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with review checkpoints.

**Goal:** Persist the inbound WhatsApp qualification state, expose controlled manual transitions in the inbox, and convert only explicitly qualified conversations into CRM leads.

**Architecture:** Treat `whatsapp_conversations` as the operational contact/conversation identity for this first increment. Add a constrained `qualification_status` column with a database default of `new`; webhook upserts will not write this column, so subsequent messages preserve the existing status. A protected route will update the status and a second protected route will create/link a lead only when the conversation is `qualified` and has no existing lead.

**Tech Stack:** Next.js App Router, TypeScript, Supabase PostgreSQL, Supabase SSR client, Vitest, existing Porto Alegre Oficial design tokens.

## Global Constraints

- Every newly created inbound conversation starts as `new`/“Novo”.
- Receiving another message in an existing conversation must not reset its status.
- Status changes are manual in this increment; no AI classification, bulk action, automation, or outbound campaign is added.
- A conversation remains a contact record even when it is marked “Engano”, “Sem interesse” or “Spam”.
- A lead can be created only from a conversation explicitly marked “Qualificado”.
- Never place credentials or provider tokens in source, tests, plans, or Obsidian notes.

---

### Task 1: Persist the qualification state

**Files:**
- Create: `supabase/migrations/20260804_add_whatsapp_qualification_status.sql`
- Modify: `src/lib/whatsapp/repository.ts`
- Test: `src/lib/whatsapp/repository.test.ts`

**Interfaces:**
- Produces `WhatsappQualificationStatus`, `qualificationStatus` on `WhatsappConversation`, and `updateConversationQualificationStatus(client, instanceId, phone, status)`.

- [ ] **Step 1: Write the failing repository tests**

Add tests proving `getConversation` maps `qualification_status`, and that a status update sends only the requested status and conversation filters.

- [ ] **Step 2: Run the focused tests and confirm they fail**

Run `npm test -- src/lib/whatsapp/repository.test.ts`. Expected: failures because the status field and update function do not exist.

- [ ] **Step 3: Add the migration**

Create the column with a safe default and check constraint:

```sql
alter table public.whatsapp_conversations
  add column if not exists qualification_status text not null default 'new';

update public.whatsapp_conversations
set qualification_status = 'new'
where qualification_status is null;

alter table public.whatsapp_conversations
  drop constraint if exists whatsapp_conversations_qualification_status_check;

alter table public.whatsapp_conversations
  add constraint whatsapp_conversations_qualification_status_check
  check (qualification_status in ('new', 'qualifying', 'qualified', 'not_interested', 'mistake', 'spam'));

create index if not exists whatsapp_conversations_qualification_status_idx
  on public.whatsapp_conversations(qualification_status);
```

- [ ] **Step 4: Implement the minimal repository support**

Use lowercase storage values and expose a type-safe constant. Add `qualification_status` to the conversation select/map. The webhook upsert payload must intentionally omit the status field. Implement the update function with `.update({ qualification_status: status }).eq(...).eq(...).select("id, qualification_status").maybeSingle()` and return a typed success/error result.

- [ ] **Step 5: Run the focused tests and confirm they pass**

Run `npm test -- src/lib/whatsapp/repository.test.ts`. Expected: PASS.

- [ ] **Step 6: Commit the persistence slice**

Run `git add supabase/migrations/20260804_add_whatsapp_qualification_status.sql src/lib/whatsapp/repository.ts src/lib/whatsapp/repository.test.ts` and commit with `feat: persist whatsapp qualification status`.

### Task 2: Add protected status transitions and lead conversion

**Files:**
- Create: `src/app/api/conversas/[phone]/status/route.ts`
- Create: `src/app/api/conversas/[phone]/lead/route.ts`
- Create: `src/lib/whatsapp/qualification.ts`
- Create: `src/lib/whatsapp/qualification.test.ts`
- Modify: `src/lib/whatsapp/repository.ts`
- Modify: `src/lib/crm/leads-repository.ts`

**Interfaces:**
- `parseQualificationStatus(value: unknown)` returns a valid status or `null`.
- `createLeadFromQualifiedConversation(...)` requires a qualified conversation, a non-empty company name and segment, and returns the created lead id plus the linked conversation id.

- [ ] **Step 1: Write failing pure-function tests**

Test accepted/rejected statuses and the conversion guard that rejects non-qualified conversations, empty company names, empty segments, or already-linked conversations.

- [ ] **Step 2: Run focused tests and confirm red**

Run `npm test -- src/lib/whatsapp/qualification.test.ts`. Expected: FAIL because the parser and conversion guard are absent.

- [ ] **Step 3: Implement the validation and conversion service**

Keep validation independent from Supabase. The route must call `requireCurrentAdmin`, verify the current conversation, accept only `qualified`, insert a lead with source `Inbound`, stage `Contato iniciado`, the authenticated owner, zero monetary values/probability, and an explicit next action `Realizar diagnóstico comercial`, then update `lead_id`. If linking fails, attempt to remove the just-created lead and return a safe error.

- [ ] **Step 4: Implement the protected route handlers**

`PATCH /api/conversas/[phone]/status` parses JSON `{ status }`, validates the status, updates the selected conversation, and returns the persisted status. `POST /api/conversas/[phone]/lead` parses `{ companyName, segment }`, performs the qualified-only conversion, and returns the lead id. Both routes must use the configured Z-API instance id and `requireCurrentAdmin`.

- [ ] **Step 5: Run focused tests and confirm green**

Run `npm test -- src/lib/whatsapp/qualification.test.ts src/lib/whatsapp/repository.test.ts`. Expected: PASS.

- [ ] **Step 6: Commit the service and routes**

Run `git add src/app/api/conversas/[phone]/status/route.ts src/app/api/conversas/[phone]/lead/route.ts src/lib/whatsapp/qualification.ts src/lib/whatsapp/qualification.test.ts src/lib/whatsapp/repository.ts src/lib/crm/leads-repository.ts` and commit with `feat: add controlled whatsapp qualification transitions`.

### Task 3: Expose the workflow in the inbox

**Files:**
- Modify: `src/app/conversas/WhatsAppInboxPanel.tsx`
- Modify: `src/app/globals.css`
- Test: `src/app/conversas/WhatsAppInboxPanel.test.tsx` (create if the current test setup supports component rendering; otherwise cover the state helpers in `src/lib/whatsapp/qualification.test.ts` and record the manual acceptance test).

**Interfaces:**
- The panel displays the status label and available actions for the selected conversation.
- Status changes refresh the selected timeline without resetting on polling.
- When status is “Qualificado” and no lead is linked, a compact conversion form asks for company and segment before creating the lead.

- [ ] **Step 1: Add the failing state-helper tests**

Test the label map and that only `qualified` exposes the conversion action when `leadId` is null.

- [ ] **Step 2: Run focused tests and confirm red**

Run `npm test -- src/lib/whatsapp/qualification.test.ts`. Expected: FAIL on the missing labels/action helper.

- [ ] **Step 3: Implement the UI controls**

Render `Novo`, `Qualificando`, `Qualificado`, `Sem interesse`, `Engano`, and `Spam` with a visible status badge. Add buttons for the manual transitions, disable terminal-state buttons when already selected, and add the conversion form only for qualified unlinked conversations. Keep the existing manual text-only composer unchanged.

- [ ] **Step 4: Add focused styles**

Add styles for the qualification badge, transition controls, and compact conversion form using existing tokens; preserve the existing desktop/mobile inbox layout.

- [ ] **Step 5: Run focused tests and manual browser acceptance**

Run `npm test -- src/lib/whatsapp/qualification.test.ts`, then manually verify: inbound chat shows “Novo”; changing to “Qualificando” persists after polling; “Qualificado” exposes conversion; conversion requires company/segment; terminal statuses do not expose conversion; an already linked lead cannot be converted twice.

- [ ] **Step 6: Commit the inbox workflow**

Run `git add src/app/conversas/WhatsAppInboxPanel.tsx src/app/globals.css src/lib/whatsapp/qualification.test.ts` and commit with `feat: expose whatsapp qualification workflow`.

### Task 4: Verify, document, and package

**Files:**
- Create: `docs/jornada/2026-08-04-registro-fluxo-contato-lead.md`
- Modify: `D:\LEONARDO\Porto Alegre Oficial\Cofre Comercial Porto Alegre Digital\04 - CRM\Proposta de Modelo — Contatos e Leads.md`
- Modify: `D:\LEONARDO\Porto Alegre Oficial\Cofre Comercial Porto Alegre Digital\90 - Governança\Mapa de Entregáveis.md`
- Create: `artifacts/crm-porto-alegre-oficial-hostinger-v9.zip` (generated package)

- [ ] **Step 1: Run the full verification suite**

Run `npm test`, `npm run lint`, `npm run build`, and `git diff --check`. Expected: all exit 0 and no warnings/errors.

- [ ] **Step 2: Update the factual project records**

Record the implementation, status semantics, migration path, tests, commit id, and the remaining operational dependency that the migration must be applied to the production Supabase project before the new controls work there. Do not record credentials or claim production deployment.

- [ ] **Step 3: Create the Hostinger package**

Run `git archive --format=zip --output=artifacts/crm-porto-alegre-oficial-hostinger-v9.zip HEAD` after the final commit and verify the archive contains the migration and route files but no `.env.local`, `node_modules`, or `.next`.

- [ ] **Step 4: Commit documentation and package**

Run `git add docs/jornada/2026-08-04-registro-fluxo-contato-lead.md docs/superpowers/plans/2026-08-04-crm-contact-lead-status-flow.md artifacts/crm-porto-alegre-oficial-hostinger-v9.zip` plus the Obsidian files only if the vault is intentionally tracked in this repository, then commit with `docs: register whatsapp contact lead flow`.

- [ ] **Step 5: Re-run verification after packaging**

Run `git status --short`, `npm test`, `npm run lint`, `npm run build`, and inspect the archive listing. Do not push or deploy as part of this plan unless explicitly requested after review.

