# Z-API WhatsApp Connection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a protected CRM screen that displays Z-API instance status and a WhatsApp QR Code without exposing credentials or sending messages.

**Architecture:** Add a server-only Z-API integration module, protected internal API routes, and a client component that fetches those routes. Keep all Z-API credentials in server-side environment variables and keep message sending out of scope.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Z-API REST endpoints, existing Supabase-authenticated admin session.

## Global Constraints

- Do not expose `ZAPI_INSTANCE_ID`, `ZAPI_INSTANCE_TOKEN`, or `ZAPI_CLIENT_TOKEN` in frontend bundles.
- Do not add message sending, message automation, webhooks, contact sync, chat sync, or Instagram integration.
- Internal Z-API routes must require an authenticated CRM admin session.
- Use TDD for behavior-bearing code.
- Validate with `npm test`, `npm run lint`, and `npm run build`.

---

### Task 1: Server-only Z-API client

**Files:**
- Create: `src/lib/zapi/config.ts`
- Create: `src/lib/zapi/client.ts`
- Test: `src/lib/zapi/client.test.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: `readZapiConfig(env?: NodeJS.ProcessEnv): ZapiConfigResult`
- Produces: `createZapiClient(config: ZapiConfig, fetcher?: typeof fetch): ZapiClient`
- Produces: `ZapiClient.getStatus(): Promise<ZapiStatusResult>`
- Produces: `ZapiClient.getQrCodeImage(): Promise<ZapiQrCodeResult>`

- [ ] Write failing tests for missing env vars, URL/header construction, status normalization, QR Code image normalization, and challenge normalization.
- [ ] Run `npm test -- src/lib/zapi/client.test.ts` and confirm failure because files do not exist.
- [ ] Implement the minimal config/client code.
- [ ] Run `npm test -- src/lib/zapi/client.test.ts` and confirm pass.
- [ ] Add Z-API env names to `.env.example` with empty values.

### Task 2: Protected internal API routes

**Files:**
- Create: `src/app/api/zapi/status/route.ts`
- Create: `src/app/api/zapi/qrcode/route.ts`

**Interfaces:**
- Consumes: `requireCurrentAdmin()`
- Consumes: `readZapiConfig()`
- Consumes: `createZapiClient()`
- Produces: `GET /api/zapi/status`
- Produces: `GET /api/zapi/qrcode`

- [ ] Implement `GET` handlers that call `requireCurrentAdmin()`.
- [ ] Return HTTP 400 for missing config using safe messages.
- [ ] Return normalized JSON for status and QR Code responses.
- [ ] Avoid returning credentials or raw URL values.

### Task 3: WhatsApp integration UI

**Files:**
- Create: `src/app/integracoes/whatsapp/WhatsAppConnectionPanel.tsx`
- Create: `src/app/integracoes/whatsapp/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/perfil/page.tsx`
- Modify: `src/app/leads/page.tsx`
- Modify: `src/app/leads/novo/page.tsx`
- Modify: `src/app/leads/[id]/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `GET /api/zapi/status`
- Consumes: `GET /api/zapi/qrcode`

- [ ] Create a protected page at `/integracoes/whatsapp`.
- [ ] Add sidebar navigation item "WhatsApp" on existing protected pages.
- [ ] Create a client panel with buttons to check status and load/refresh QR Code.
- [ ] Render connected/not connected/smartphone state.
- [ ] Render `data:image/png;base64,{value}` when a QR Code image is available.
- [ ] Render challenge/passkey operational warning when returned.
- [ ] Add conservative helper copy: QR Code expires quickly; no automatic sending is active.

### Task 4: Verification and release

**Files:**
- Modify: `README.md`

- [ ] Update README with Z-API env vars and the V1 safety boundary.
- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Review `git diff --stat` and `git status --short --branch`.
- [ ] Commit implementation with `feat: conectar whatsapp via z-api`.
- [ ] Push `main`.
